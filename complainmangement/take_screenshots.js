const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const outputDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const loginAndSubmit = async (roleName) => {
        await page.goto('http://localhost:5173');
        await new Promise(r => setTimeout(r, 2000));

        // 1. Click the demo button
        await page.evaluate((role) => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const roleBtn = buttons.find(b => b.textContent.includes(role));
            if (roleBtn) roleBtn.click();
        }, roleName);

        // Wait for React state to update the input fields
        await new Promise(r => setTimeout(r, 500));

        // 2. Click submit
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const submitBtn = buttons.find(b => b.textContent.includes('Sign In') || (b.type === 'submit' && b.className.includes('primary')));
            if (submitBtn) submitBtn.click();
        });

        // Wait for page transition and network requests to finish
        // We can wait for the specific dashboard strings or just wait
        await new Promise(r => setTimeout(r, 3000));
    };

    try {
        console.log("1. Taking Login Page screenshot...");
        await page.goto('http://localhost:5173');
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: path.join(outputDir, '01_login_page.png') });

        console.log("2. Logging in as Admin...");
        await loginAndSubmit('Admin');

        console.log("3. Admin Dashboard Top screenshot...");
        await page.screenshot({ path: path.join(outputDir, '02_admin_dashboard_top.png') });

        console.log("4. Admin Dashboard Bottom screenshot...");
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(outputDir, '03_admin_dashboard_bottom.png') });

        console.log("5. Admin Complaints List screenshot...");
        await page.goto('http://localhost:5173/admin/complaints');
        await new Promise(r => setTimeout(r, 1500));
        await page.screenshot({ path: path.join(outputDir, '04_admin_complaints_list.png') });

        console.log("6. Admin Users List screenshot...");
        await page.goto('http://localhost:5173/admin/users');
        await new Promise(r => setTimeout(r, 1500));
        await page.screenshot({ path: path.join(outputDir, '05_admin_users_list.png') });

        console.log("Logging out Admin...");
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        const client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');
        await new Promise(r => setTimeout(r, 1000));

        console.log("7. Logging in as Staff...");
        await loginAndSubmit('Staff 1');

        console.log("8. Staff Dashboard screenshot...");
        await page.screenshot({ path: path.join(outputDir, '06_staff_dashboard.png') });

        console.log("9. Staff Complaints screenshot...");
        await page.goto('http://localhost:5173/staff/complaints');
        await new Promise(r => setTimeout(r, 1500));
        await page.screenshot({ path: path.join(outputDir, '07_staff_complaints_list.png') });

        console.log("Logging out Staff...");
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        await client.send('Network.clearBrowserCookies');
        await new Promise(r => setTimeout(r, 1000));

        console.log("10. Logging in as Student...");
        await loginAndSubmit('User 1');

        console.log("11. Student Dashboard screenshot...");
        await page.screenshot({ path: path.join(outputDir, '08_student_dashboard.png') });

        console.log("12. Student Submit Complaint screenshot...");
        await page.goto('http://localhost:5173/user/new-complaint');
        await new Promise(r => setTimeout(r, 1500));
        await page.screenshot({ path: path.join(outputDir, '09_student_new_complaint.png') });

        console.log("13. Student My Complaints screenshot...");
        await page.goto('http://localhost:5173/user/complaints');
        await new Promise(r => setTimeout(r, 1500));
        await page.screenshot({ path: path.join(outputDir, '10_student_my_complaints.png') });

        console.log(`\n✅ Successfully took 10 unique screenshots! They are saved in: ${outputDir}`);
    } catch (e) {
        console.error("Error during screenshot process:", e);
    } finally {
        await browser.close();
    }
})();
