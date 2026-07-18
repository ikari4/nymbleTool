
// main script begins here
// on page load
window.addEventListener("load", async() => {
    
    const loginModal = document.getElementById("loginModal");
    const loginBtn = document.getElementById("loginBtn");
    const logout = document.getElementById("logout");
    const username = localStorage.getItem("nymname");
    const playerId = localStorage.getItem("nymId"); 

    // show login screen if user not logged in
    if(!username) {
        loginModal.style.display = "block";
        return;

    } else {

        // logout button
        
        const logoutBtn = document.createElement("button");
        logoutBtn.classList = "button";
        logoutBtn.innerHTML = "Logout";
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem('nymname');
            localStorage.removeItem('nymId');
            location.reload();
        });
        logout.appendChild(logoutBtn);
    }; 
});




// splash screen fadeaway
window.addEventListener("load", () => {
    setTimeout(() => {
        const splash = document.getElementById("splash");
        splash.style.opacity = "0";

        setTimeout(() => {
            splash.style.display = "none";
            page.style.display = "block";
        }, 500);
    }, 3000);
});

// on 'login' button click
loginBtn.addEventListener("click", async () => {
    const inputEmail = document.getElementById("inputEmail").value;
    const inputPassword = document.getElementById("inputPassword").value;

    // call the backend js
    const loginRes = await fetch("/api/loginLogic", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ inputEmail, inputPassword })
    });

    // process the returned data
    const data = await loginRes.json();
    if (!loginRes.ok) {
        document.getElementById("loginError").textContent = data.error;
        return;
    }
    
    // save the date in local storage and reload page
    localStorage.setItem("nymname", data.user.username);
    localStorage.setItem("nymId", data.user.playerId);
    document.getElementById("loginModal").style.display = "none";
    location.reload();
});