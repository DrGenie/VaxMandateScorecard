// script.js
document.addEventListener("DOMContentLoaded", function() {
  // Update total points dynamically
  const inputs = document.querySelectorAll('input[type="number"]');
  const totalPointsEl = document.getElementById('totalPoints');
  const errorMsg = document.getElementById('errorMsg');

  function updateTotal() {
    let total = 0;
    inputs.forEach(input => {
      total += parseFloat(input.value) || 0;
    });
    totalPointsEl.textContent = total;
    errorMsg.style.display = (total !== 100) ? 'block' : 'none';
  }
  inputs.forEach(input => {
    input.addEventListener('input', updateTotal);
  });
  updateTotal(); // Initialize on page load

  // Modal elements
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');
  const modalOk = document.getElementById('modalOk');
  const modalSummary = document.getElementById('modalSummary');

  function showModal(summaryHTML) {
    modalSummary.innerHTML = summaryHTML;
    modal.style.display = "block";
  }
  closeModal.onclick = function() {
    modal.style.display = "none";
  }
  modalOk.onclick = function() {
    modal.style.display = "none";
  }
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  // LocalStorage key for storing submissions
  const storageKey = "vaccineMandateSubmissions";

  // Retrieve stored submissions or initialize as empty array
  function getStoredSubmissions() {
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : [];
  }
  
  // Save a new submission to localStorage
  function saveSubmission(submission) {
    const submissions = getStoredSubmissions();
    submissions.push(submission);
    localStorage.setItem(storageKey, JSON.stringify(submissions));
  }

  // Convert submissions array to CSV string
  function convertToCSV(submissions) {
    if (submissions.length === 0) return '';
    const headers = Object.keys(submissions[0]).join(',');
    const rows = submissions.map(submission => {
      return Object.values(submission).map(value => `"${value}"`).join(',');
    });
    return headers + "\n" + rows.join("\n");
  }

  // Trigger CSV download
  function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Handle form submission: send email via EmailJS then store and show modal
  document.getElementById('scorecardForm').addEventListener('submit', function(e) {
    e.preventDefault();
    let total = 0;
    inputs.forEach(input => {
      total += parseFloat(input.value) || 0;
    });
    if(total !== 100) {
      alert('Please allocate exactly 100 points across all attributes.');
      return;
    }
    // Send email via EmailJS (update service/template IDs as needed)
    emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', this)
      .then(function(response) {
        console.log('SUCCESS!', response.status, response.text);
      }, function(error) {
        console.log('FAILED...', error);
      });
    
    // Process form data and store submission
    const formData = new FormData(this);
    let submission = {};
    let summaryHTML = "<ul>";
    formData.forEach((value, key) => {
      submission[key] = value;
      if(key.startsWith("points_")) {
        let attrName = key.replace("points_", "").replace("_", " ");
        summaryHTML += `<li><strong>${attrName}:</strong> ${value} points</li>`;
      }
    });
    summaryHTML += "</ul>";
    // Save submission to localStorage
    saveSubmission(submission);
    showModal(summaryHTML);
  });

  // Download collected data as CSV when clicking the download button
  document.getElementById('downloadData').addEventListener('click', function() {
    const submissions = getStoredSubmissions();
    const csv = convertToCSV(submissions);
    if (!csv) {
      alert("No data collected yet.");
      return;
    }
    downloadCSV(csv, "vaccine_mandate_submissions.csv");
  });
});
