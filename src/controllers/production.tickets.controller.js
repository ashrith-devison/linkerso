import axios from 'axios';

const deploymentFromVercel = async (projectId) => {
  const res = await axios.get(
    `https://api.vercel.com/v6/deployments`,
    {
      params: {
        projectId: projectId,
        target: 'staging',
        limit: 20,
      },
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API}`,
      },
    }
  );

  return res.data.deployments.map(dep => ({
    id: dep.uid, // Added deployment ID
    url: dep.url,
    name: dep.name,
    state: dep.state,
    created: new Date(dep.createdAt).toLocaleString(),
    meta: dep.meta || {},
  }));
};

const deleteDeploymentFromVercel = async (deploymentId) => {
  const response = await axios.delete(
    `https://api.vercel.com/v13/deployments/${deploymentId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API}`,
      },
    }
  );

  return {
    status: response.status,
    message: `Deployment ${deploymentId} deleted successfully.`,
  };
};

export default {
  deploymentFromVercel,
  deleteDeploymentFromVercel,
};
