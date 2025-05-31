import { Router } from "express";
import utils from "../utils/index.utils.js";

const router = Router();

import simpleGit from 'simple-git';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';


const isValidCommitId = (id) => /^[0-9a-f]{7,40}$/i.test(id);

const checkCommit = async (commitId) => {
    if (!commitId || !isValidCommitId(commitId)) {
        return "Check the Commit Id once again";
    }

    const tempDir = path.join(os.tmpdir(), uuidv4());
    console.log(`📁 Temporary directory: ${tempDir}`);
    await fs.ensureDir(tempDir);

    const git = simpleGit();

    try {
        await git.clone(process.env.REPO_URL, tempDir, ['--no-checkout', '--filter=blob:none']);
        const repo = simpleGit(tempDir);

        console.log(`⬇️ Fetching commit ${commitId}`);
        await repo.fetch(['origin', commitId]);

        await repo.checkout(commitId);
        console.log(`✅ Checked out commit ${commitId} (detached HEAD)`);
        // current commit head
        const currentCommit = await repo.revparse(['HEAD']);
        console.log(`Current commit: ${currentCommit}`);
        if (currentCommit !== commitId) {
            console.error(`❌ Commit ${commitId} does not match HEAD: ${currentCommit}`);
            await fs.remove(tempDir); 
            return false; 
        }

        return tempDir; // Success: return path to repo at that commit
    } catch (err) {
        console.error(`❌ Error checking out commit: ${err.message}`);
        await fs.remove(tempDir);
        return false;
    }
};

router.post('/check-commit', async (req, res) => {
  const { commitId } = req.body;
    if (!commitId) {
        return utils.ApiResponse.error(res, 400, "Commit ID is required","Please provide a commit ID to check.");
    }
    const isValid = await checkCommit(commitId);
    if(isValid){
        setTimeout(() => {
            fs.remove(isValid)
                .then(() => console.log(`🧹 Deleted temp dir: ${isValid}`))
                .catch(err => console.error(`Error deleting temp dir: ${err.message}`));
            }, 0.4* 60 * 1000);
        return utils.ApiResponse.success(res,"Commit ID is valid",isValid);
    }
    else
        return utils.ApiResponse.error(res,202,"Commit ID is not valid", "Check the commit ID once again");
    
});

router.get('/deployment-history', async (req, res) => {
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!projectId) {
    return utils.ApiResponse.error(
      res,
      400,
      "Project ID is required",
      "Please provide a project ID to fetch deployment history."
    );
  }

  try {
    const deployments = await vercelControllers.deploymentFromVercel(projectId);
    return utils.ApiResponse.success(res, "Deployment History Fetched Successfully", deployments);
  } catch (err) {
    console.error('Error fetching deployments:', err);
    return utils.ApiResponse.error(res, 500, "Failed to fetch deployment history", err.message);
  }
});


router.delete('/delete-deployment/:deploymentId', async (req, res) => {
  const { deploymentId } = req.params;
  if (!deploymentId) {
    return utils.ApiResponse.error(
      res,
      400,
      "Deployment ID is required",
      "Please provide a deployment ID to delete."
    );
  }

  try {
    const response = await vercelControllers.deleteDeploymentFromVercel(deploymentId);
    return utils.ApiResponse.success(res, "Deployment Deleted Successfully", response);
  } catch (err) {
    console.error('Error deleting deployment:', err);
    return utils.ApiResponse.error(res, 500, "Failed to delete deployment", err.message);
  }
});

export default router;