// Helper function to show a specific form and hide others
function showForm(formId) {
    const forms = document.querySelectorAll('.auth-form');
    forms.forEach(form => {
        // Instant non-smooth toggle using classes defined in rm.css
        form.classList.remove('active-form');
        form.classList.add('hidden-form');
    });

    const targetForm = document.getElementById(formId);
    if (targetForm) {
        targetForm.classList.remove('hidden-form');
        targetForm.classList.add('active-form');
    }
}

// Helper function to switch tab buttons visual state
function setActiveTab(tabName) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    if(activeBtn) activeBtn.classList.add('active');
}

document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabButtonsContainer = document.querySelector('.tab-buttons');
    
    // Get all form/view elements by their IDs
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const verificationForm = document.getElementById('verificationForm');
    const forgotPasswordView = document.getElementById('forgotPasswordView');
    
    // Get all interactive elements
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const backToLoginLink = document.getElementById('backToLogin');
    const sendResetLinkBtn = document.getElementById('sendResetLinkBtn');
    const goToLoginBtn = document.getElementById('goToLoginBtn'); 
    
    // 0. Initialize the view to Login
    setActiveTab('login'); 

    // --- Tab Switching Logic ---
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            setActiveTab(targetTab);
            
            if (targetTab === 'login') {
                showForm('loginForm');
            } else if (targetTab === 'register') {
                showForm('registerForm');
                // Reset form fields when switching to Register
                registerForm.reset(); 
            }
        });
    });

    // --- 1. Register Submission ---
    registerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        // Simulate unique ID generation
        const uniqueId = Math.floor(100000 + Math.random() * 900000); 

        console.log(`Registration submitted for: ${email}. Simulated Unique ID: ${uniqueId}`);

        alert(`Registration successful! Check your email (${email}) for your Unique ID: ${uniqueId}. This ID and your password are required for login.`);
        
        tabButtonsContainer.style.display = 'none';
        
        showForm('verificationForm');
        registerForm.reset();
    });
    
    // --- 2. Go to Login Button after Registration Success ---
    goToLoginBtn.addEventListener('click', function() {
        tabButtonsContainer.style.display = 'flex';
        setActiveTab('login');
        showForm('loginForm');
    });


    // --- 3. Login Submission (Redirects to POS) ---
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const uniqueId = document.getElementById('loginUniqueId').value;
        const password = document.getElementById('loginPassword').value;

        if (uniqueId && password) {
            console.log(`Attempting login with Unique ID: ${uniqueId}`);
            
            // Final Redirection to POS Interface (Silent)
            window.location.href = './pos.html'; 
        } else {
             alert('Please enter your Unique ID and password.');
        }
    });

    // --- 4. Forgot Password Flow ---
    forgotPasswordLink.addEventListener('click', function(event) {
        event.preventDefault();
        tabButtonsContainer.style.display = 'none';
        showForm('forgotPasswordView');
    });

    backToLoginLink.addEventListener('click', function(event) {
        event.preventDefault();
        tabButtonsContainer.style.display = 'flex';
        setActiveTab('login');
        showForm('loginForm');
    });

    sendResetLinkBtn.addEventListener('click', function() {
        const resetEmail = document.getElementById('resetEmail').value;
        if (resetEmail) {
            alert(`Password reset link sent to ${resetEmail}! Please check your email.`);
            
            // After sending link, go back to login
            tabButtonsContainer.style.display = 'flex';
            setActiveTab('login');
            showForm('loginForm');
        } else {
            alert('Please enter your email address.');
        }
    });
});