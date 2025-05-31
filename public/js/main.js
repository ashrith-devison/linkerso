function openModal() {
  document.getElementById("deploymentModal").classList.add("show");
}
function closeModal() {
  document.getElementById("deploymentModal").classList.remove("show");
}

// Simple escape function to avoid HTML injection (basic)
function escapeHtml(text) {
  return text.replace(/[&<>"'`=\/]/g, function (s) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '`': '&#96;',
      '=': '&#61;',
      '/': '&#47;'
    })[s];
  });
}

function submitDeployment() {
  const now = new Date();
  // Format date to yyyy-MM-dd hh:mm AM/PM
  const formattedDate = now.toLocaleString('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
    hour12: true
  });

  const version = document.getElementById("input-version").value.trim();
  const commitId = document.getElementById("input-commit").value.trim();
  const comments = document.getElementById("input-comments").value.trim();

  if (!version || !commitId) {
    alert("Please fill in all required fields.");
    return;
  }

  // Update last deployed summary fields
  document.getElementById("deployed-date").innerText = formattedDate;
  document.getElementById("deployed-source").innerText = currentUsername;
  document.getElementById("deployed-version").innerText = version;
  document.getElementById("deployed-commit").innerText = commitId;
  document.getElementById("deployed-comments").innerText = comments;

  // Escape values for safe HTML insertion
  const safeVersion = escapeHtml(version);
  const safeCommitId = escapeHtml(commitId);
  const safeComments = escapeHtml(comments).replace(/\n/g, "<br>");
  const safeDate = escapeHtml(formattedDate);
  const safeUser = escapeHtml(currentUsername);

  const data = {
    version : safeVersion,
    commitId : safeCommitId,
    commitMessage : safeComments,
    date : safeDate,
    username : safeUser
  };
  alert("Initiating Deployment ....");
  InitiateDeployment(data);
  // Add new deployment to the history table tbody at the top
  const tbody = document.querySelector("#history table tbody");
  if (tbody) {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td>${safeDate}</td>
      <td>${safeVersion}</td>
      <td>${safeUser}</td>
      <td class="commit-id">${safeCommitId}</td>
      <td style="white-space: pre-wrap;">${safeComments}</td>
    `;
    
    if (tbody.firstChild) {
      tbody.insertBefore(newRow, tbody.firstChild);
    } else {
      tbody.appendChild(newRow);
    }
  } else {
    console.error("Deployment history table body not found!");
  }

  document.getElementById("input-version").value = "";
  document.getElementById("input-commit").value = "";
  document.getElementById("input-comments").value = "";

  alert("Deployment Created Successfully....")
  closeModal();
}

function toggleHistory() {
  const history = document.getElementById("history");
  history.style.display = history.style.display === "none" || history.style.display === "" ? "block" : "none";
}



const InitiateDeployment = async (data) => {
  const response = await fetch('/prod/deploy',{
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (response.ok) {
    const result = await response.json();
    console.log("Deployment Result:", result);
    alert("Deployment Successful! URL: " + result.data.deploymentUrl);
  } else {
    const errorText = await response.text();
    console.error("Deployment Error:", errorText);
    alert("Deployment Failed: " + errorText);
  }
}
