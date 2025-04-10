const bannerSource = document.getElementById('bannerSource');
const bannerUploadContainer = document.getElementById('bannerUploadContainer');
const bannerLinkContainer = document.getElementById('bannerLinkContainer');
const bodyChoice = document.getElementById('bodyChoice');
const customBody = document.getElementById('customBody');

bannerSource.addEventListener('change', function () {
  bannerUploadContainer.style.display = this.value === 'upload' ? 'block' : 'none';
  bannerLinkContainer.style.display = this.value === 'link' ? 'block' : 'none';
});

bodyChoice.addEventListener('change', function () {
  customBody.style.display = this.value === 'custom' ? 'block' : 'none';
});

function drawLabelAndValue(doc, label, value, x, y) {
  doc.setFont(undefined, 'bold');
  doc.text(label, x, y);
  const labelWidth = doc.getTextWidth(label);
  doc.setFont(undefined, 'normal');
  doc.text(value, x + labelWidth + 2, y);
}

document.getElementById('pdfForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    alert("jsPDF is not loaded correctly.");
    return;
  }
  const doc = new jsPDF();

  const address = document.getElementById('address').value;
  const phone = document.getElementById('phone').value;
  const patientName = document.getElementById('patientName').value;
  const age = document.getElementById('age').value;
  const gender = document.getElementById('gender').value;
  const dob = document.getElementById('dob').value;
  const visitDate = document.getElementById('visitDate').value;
  const throughDate = document.getElementById('throughDate').value;
  const subject = document.getElementById('subject').value;
  const bodyType = document.getElementById('bodyChoice').value;
  const body = bodyType === 'boiler' 
    ? `Please excuse ${patientName} from work or school related activities through ${throughDate}. He/She is under my care for a medical condition, and has been advised to take time off to recover.` 
    : document.getElementById('customBody').value;
  const signature = document.getElementById('signature').value;

  const useUpload = bannerSource.value === 'upload';

  function drawPDF(imgData) {
    doc.addImage(imgData, 'JPEG', 10, 10, 190, 40);
    doc.setFontSize(12);
    let y = 60;

    doc.setFont(undefined, 'normal');
    doc.text(address, 10, y); y += 10;
    doc.text(phone, 10, y); y += 10;

    drawLabelAndValue(doc, 'Patient: ', patientName, 10, y);
    drawLabelAndValue(doc, 'Age: ', age, 70, y);
    drawLabelAndValue(doc, 'Gender: ', gender, 110, y);
    drawLabelAndValue(doc, 'DOB: ', dob, 150, y);
    y += 10;
    drawLabelAndValue(doc, 'Date of Visit: ', visitDate, 10, y); y += 20;
    drawLabelAndValue(doc, 'Subject: ', subject, 10, y); y += 10;

    const splitBody = doc.splitTextToSize(body, 180);
    doc.setFont(undefined, 'normal');
    doc.text(splitBody, 10, y); y += splitBody.length * 10;

    drawLabelAndValue(doc, 'Signature: ', signature, 10, y);
    doc.save('generated_document.pdf');
  }

  if (useUpload) {
    const bannerInput = document.getElementById('banner');
    if (bannerInput.files.length > 0) {
      const file = bannerInput.files[0];
      const reader = new FileReader();
      reader.onload = function(e) {
        drawPDF(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a banner image.');
    }
  } else {
    const url = document.getElementById('bannerLink').value;
    const image = new Image();
    image.crossOrigin = 'Anonymous';
    image.src = url;
    image.onload = function() {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      const imgData = canvas.toDataURL('image/png');
      drawPDF(imgData);
    };
    image.onerror = function() {
      alert('Unable to load image from the provided link.');
    };
  }
});