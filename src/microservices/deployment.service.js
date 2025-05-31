import { Router } from "express";
import utils from "../utils/index.utils.js";

const router = Router();

const checkCommit = async (commitId) => {
    if (!commitId || !isValidCommitId(commitId)) {
        return "Check the Commit Id once again";
    }
    const tempDir = path.join('/tmp', uuidv4());
    await fs.ensureDir(tempDir);

    const git = simpleGit();

    try {
        let exists = false;
        for (const depth of DEPTH_LEVELS) {
            console.log(`Trying with depth = ${depth}`);
            await fs.emptyDir(tempDir);
            try {
                await git.clone(process.env.REPO_URL, tempDir, [`--depth=${depth}`]);
                const repo = simpleGit(tempDir);

                exists = await repo.raw(['cat-file', 't', commitId])
                    .then(output => output.trim() === 'commit')
                    .catch(() => false);

                if (exists) {
                    console.log(`Commit found at depth ${depth}`);
                    return tempDir; // You can now read from here temporarily
                }
            } catch (err) {
                console.warn(`Clone or check failed at depth=${depth}:`, err.message);
            }
        }
    } catch (err) {
        console.warn("Fatal Error in Scanning the Repo", err.message);
        await fs.remove(tempDir);
        return err.message;
    }

    return false;
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