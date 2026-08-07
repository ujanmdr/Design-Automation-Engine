const fs = require('fs');
const path = require('path');
const http = require('http');

const employeesJsonPath = 'C:/Users/ujan/Desktop/Birthday & Video Automation/birthday-app/src/data/employees.json';
const publicDir = 'C:/Users/ujan/Desktop/Birthday & Video Automation/birthday-app/public';

// Helper to construct a multipart form-data request body
function buildMultipartBody(fields, files, boundary) {
  let chunks = [];
  
  for (const [name, value] of Object.entries(fields)) {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`));
  }
  
  for (const [name, file] of Object.entries(files)) {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"; filename="${file.filename}"\r\nContent-Type: ${file.mime}\r\n\r\n`));
    chunks.push(file.buffer);
    chunks.push(Buffer.from('\r\n'));
  }
  
  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  return Buffer.concat(chunks);
}

async function testAddEmployee() {
  try {
    const boundary = '----TestBoundary' + Math.random().toString(36).substring(2);
    
    const fields = {
      name: "Temporary Test User",
      title: "Temporary Intern",
      email: "temp.intern@gritfeat.com",
      birthday: "11-11",
      appointmentDate: "05-May-2025"
    };

    const dummyImageBuffer = Buffer.from("Fake Image Data");
    const files = {
      birthdayPhoto: { filename: "dummy_bday.png", mime: "image/png", buffer: dummyImageBuffer },
      idPhoto: { filename: "dummy_id.png", mime: "image/png", buffer: dummyImageBuffer }
    };

    const postData = buildMultipartBody(fields, files, boundary);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/employees',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': postData.length
      }
    };

    console.log("Sending POST request to create employee...");
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', async () => {
        console.log('Status Code:', res.statusCode);
        const response = JSON.parse(body);
        console.log('Response:', response);

        if (response.success) {
          const emp = response.employee;
          console.log(`Created Employee ID: ${emp.id}`);
          console.log(`Generated Casing Filename: ${emp.photoFileName}`);

          // 1. Verify existence in employees.json and files on disk
          const updatedEmployees = JSON.parse(fs.readFileSync(employeesJsonPath, 'utf8'));
          const employeeExists = updatedEmployees.some(e => e.id === emp.id);
          
          const idCardPhotoPath = path.join(publicDir, 'assets/templates/Id Card Employee Images', emp.photoFileName);
          const birthdayPhotoPath = path.join(publicDir, 'assets/templates/Birthday Post Employee Images', emp.photoFileName);
          
          const idCardPhotoExists = fs.existsSync(idCardPhotoPath);
          const birthdayPhotoExists = fs.existsSync(birthdayPhotoPath);

          console.log("\n=== POST VERIFICATION RESULTS ===");
          console.log("Employee added to JSON:", employeeExists ? "PASSED" : "FAILED");
          console.log("ID Card Photo uploaded:", idCardPhotoExists ? "PASSED" : "FAILED");
          console.log("Birthday Photo uploaded:", birthdayPhotoExists ? "PASSED" : "FAILED");

          // 2. Perform cleanup via DELETE API route
          console.log("\nCleaning up test employee...");
          const deleteOptions = {
            hostname: 'localhost',
            port: 3000,
            path: `/api/employees?id=${emp.id}`,
            method: 'DELETE'
          };

          const deleteReq = http.request(deleteOptions, (delRes) => {
            let delBody = '';
            delRes.on('data', (chunk) => delBody += chunk);
            delRes.on('end', () => {
              const delResponse = JSON.parse(delBody);
              console.log('DELETE Status Code:', delRes.statusCode);
              console.log('DELETE Response:', delResponse);

              // Verify cleanup
              const finalEmployees = JSON.parse(fs.readFileSync(employeesJsonPath, 'utf8'));
              const employeeRemoved = !finalEmployees.some(e => e.id === emp.id);
              const idCardPhotoDeleted = !fs.existsSync(idCardPhotoPath);
              const birthdayPhotoDeleted = !fs.existsSync(birthdayPhotoPath);

              console.log("\n=== CLEANUP VERIFICATION RESULTS ===");
              console.log("Employee removed from JSON:", employeeRemoved ? "PASSED" : "FAILED");
              console.log("ID Card Photo deleted:", idCardPhotoDeleted ? "PASSED" : "FAILED");
              console.log("Birthday Photo deleted:", birthdayPhotoDeleted ? "PASSED" : "FAILED");
            });
          });
          deleteReq.end();
        }
      });
    });

    req.on('error', (e) => {
      console.error(`Problem with request: ${e.message}`);
    });

    req.write(postData);
    req.end();

  } catch (err) {
    console.error("Test failed with error:", err);
  }
}

testAddEmployee();
