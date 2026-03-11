export const renderHomePage = () => {
  const app = document.getElementById('root')
  
  app.innerHTML = `
    <div style="min-height: 100vh; background-color: #fafbfc;">
      <nav style="background: white; padding: 1.25rem 2rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <h1 style="color: #e879a8; font-size: 1.5rem; font-weight: 700; margin: 0;">Finance Manager</h1>
        <div style="display: flex; gap: 2rem; align-items: center;">
          <a href="#features" style="color: #1a1a1a; text-decoration: none; font-weight: 500; transition: color 0.3s;">Features</a>
          <a href="#how" style="color: #1a1a1a; text-decoration: none; font-weight: 500; transition: color 0.3s;">How It Works</a>
          <a href="#faq" style="color: #1a1a1a; text-decoration: none; font-weight: 500; transition: color 0.3s;">FAQ</a>
          <a href="/login" style="background-color: #ef4444; color: white; padding: 0.65rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; transition: background 0.3s;">Login</a>
        </div>
      </nav>

      <div style="background: linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.5)), url('/finance-hero.jpg') center/cover; min-height: 600px; display: flex; align-items: center; justify-content: space-between; padding: 4rem 2rem; position: relative; color: white;">
        <div style="max-width: 50%; z-index: 2;">
          <h2 style="font-size: 3.5rem; font-weight: 700; margin: 0 0 1.5rem; line-height: 1.1;">MANAGE YOUR MONEY SMARTER</h2>
          <p style="font-size: 1.1rem; margin: 0 0 2rem; line-height: 1.6; opacity: 0.95;">Take control of your finances with intelligent budgeting, real-time tracking, and personalized insights. Track every expense and build the financial future you deserve.</p>
          <div style="display: flex; gap: 1rem;">
            <a href="/register" style="background-color: #ef4444; color: white; padding: 0.875rem 2rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; transition: all 0.3s; display: inline-block;">Get Started</a>
            <a href="#features" style="background-color: transparent; color: white; padding: 0.875rem 2rem; border: 2px solid white; border-radius: 0.5rem; text-decoration: none; font-weight: 600; transition: all 0.3s; display: inline-block;">Learn More</a>
          </div>
        </div>
        <div style="flex: 1; height: 400px;"></div>
      </div>

      <div style="padding: 4rem 2rem; background-color: #f9fafb;">
        <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center; margin-bottom: 4rem;">
          <div>
            <h2 style="font-size: 2.5rem; font-weight: 700; color: #1a1a1a; margin: 0 0 1.5rem;">Smart Financial Planning</h2>
            <p style="color: #666666; font-size: 1.05rem; line-height: 1.7; margin: 0;">Manage your money like never before with our intelligent financial planning tools. Track every expense, set budgets, and watch your savings grow with detailed analytics and real-time insights.</p>
          </div>
          <img src="/finance-planning.jpg" alt="Financial Planning" style="width: 100%; height: 350px; object-fit: cover; border-radius: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        </div>

        <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center; grid-template-areas: 'img content';">
          <img src="/financial-growth.jpg" alt="Financial Growth" style="width: 100%; height: 350px; object-fit: cover; border-radius: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); grid-area: img;">
          <div style="grid-area: content;">
            <h2 style="font-size: 2.5rem; font-weight: 700; color: #1a1a1a; margin: 0 0 1.5rem;">Watch Your Growth</h2>
            <p style="color: #666666; font-size: 1.05rem; line-height: 1.7; margin: 0;">See your financial progress in action. Our visual reports and charts make it easy to understand your spending habits and identify opportunities to save more and invest better.</p>
          </div>
        </div>
      </div>

      <div id="features" style="padding: 4rem 2rem; background-color: white;">
        <h2 style="text-align: center; font-size: 2.5rem; font-weight: 700; color: #1a1a1a; margin: 0 0 0.5rem;">Key Features</h2>
        <p style="text-align: center; color: #666666; margin: 0 0 3rem; font-size: 1.1rem;">Everything you need to manage your finances</p>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; max-width: 1200px; margin: 0 auto;">
          <div style="padding: 2rem; background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%); border-radius: 1rem; border: 1px solid #d4d4d4;">
            <div style="width: 3rem; height: 3rem; background-color: #b8e0f0; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; font-size: 1.5rem;">📊</div>
            <h3 style="color: #1a1a1a; font-size: 1.25rem; font-weight: 600; margin: 0 0 0.5rem;">Smart Analytics</h3>
            <p style="color: #666666; font-size: 0.95rem; margin: 0;">Get detailed insights into your spending patterns with advanced charts and reports.</p>
          </div>

          <div style="padding: 2rem; background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%); border-radius: 1rem; border: 1px solid #d4d4d4;">
            <div style="width: 3rem; height: 3rem; background-color: #b8e0f0; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; font-size: 1.5rem;">💰</div>
            <h3 style="color: #1a1a1a; font-size: 1.25rem; font-weight: 600; margin: 0 0 0.5rem;">Budget Management</h3>
            <p style="color: #666666; font-size: 0.95rem; margin: 0;">Set and track budgets with real-time alerts when you're approaching limits.</p>
          </div>

          <div style="padding: 2rem; background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%); border-radius: 1rem; border: 1px solid #d4d4d4;">
            <div style="width: 3rem; height: 3rem; background-color: #b8e0f0; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; font-size: 1.5rem;">⭐</div>
            <h3 style="color: #1a1a1a; font-size: 1.25rem; font-weight: 600; margin: 0 0 0.5rem;">Health Score</h3>
            <p style="color: #666666; font-size: 0.95rem; margin: 0;">Get a personalized financial health score based on your spending habits.</p>
          </div>

          <div style="padding: 2rem; background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%); border-radius: 1rem; border: 1px solid #d4d4d4;">
            <div style="width: 3rem; height: 3rem; background-color: #b8e0f0; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; font-size: 1.5rem;">🎯</div>
            <h3 style="color: #1a1a1a; font-size: 1.25rem; font-weight: 600; margin: 0 0 0.5rem;">Goal Tracking</h3>
            <p style="color: #666666; font-size: 0.95rem; margin: 0;">Set financial goals and track your progress toward achieving them.</p>
          </div>

          <div style="padding: 2rem; background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%); border-radius: 1rem; border: 1px solid #d4d4d4;">
            <div style="width: 3rem; height: 3rem; background-color: #b8e0f0; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; font-size: 1.5rem;">📈</div>
            <h3 style="color: #1a1a1a; font-size: 1.25rem; font-weight: 600; margin: 0 0 0.5rem;">Reports & Insights</h3>
            <p style="color: #666666; font-size: 0.95rem; margin: 0;">Generate comprehensive reports and gain valuable insights about your finances.</p>
          </div>

          <div style="padding: 2rem; background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%); border-radius: 1rem; border: 1px solid #d4d4d4;">
            <div style="width: 3rem; height: 3rem; background-color: #b8e0f0; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; font-size: 1.5rem;">💳</div>
            <h3 style="color: #1a1a1a; font-size: 1.25rem; font-weight: 600; margin: 0 0 0.5rem;">Easy Tracking</h3>
            <p style="color: #666666; font-size: 0.95rem; margin: 0;">Quickly add and categorize transactions for effortless expense tracking.</p>
          </div>
        </div>
      </div>

      <div id="how" style="padding: 4rem 2rem; background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%);">
        <h2 style="text-align: center; font-size: 2.5rem; font-weight: 700; color: #1a1a1a; margin: 0 0 0.5rem;">How It Works</h2>
        <p style="text-align: center; color: #666666; margin: 0 0 3rem; font-size: 1.1rem;">Four simple steps to financial control</p>
        
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; max-width: 1200px; margin: 0 auto;">
          <div style="text-align: center; padding: 2rem; background: white; border-radius: 1rem; border: 1px solid #d4d4d4;">
            <div style="width: 3.5rem; height: 3.5rem; background: linear-gradient(135deg, #b8e0f0, #7cc8e5); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: white; font-weight: 700; font-size: 1.5rem;">1</div>
            <h3 style="color: #1a1a1a; font-size: 1.1rem; font-weight: 600; margin: 0 0 0.75rem;">Sign Up</h3>
            <p style="color: #666666; font-size: 0.9rem; margin: 0;">Create your account in seconds with email or Google.</p>
          </div>

          <div style="text-align: center; padding: 2rem; background: white; border-radius: 1rem; border: 1px solid #d4d4d4;">
            <div style="width: 3.5rem; height: 3.5rem; background: linear-gradient(135deg, #b8e0f0, #7cc8e5); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: white; font-weight: 700; font-size: 1.5rem;">2</div>
            <h3 style="color: #1a1a1a; font-size: 1.1rem; font-weight: 600; margin: 0 0 0.75rem;">Add Transactions</h3>
            <p style="color: #666666; font-size: 0.9rem; margin: 0;">Log your income and expenses as they happen.</p>
          </div>

          <div style="text-align: center; padding: 2rem; background: white; border-radius: 1rem; border: 1px solid #d4d4d4;">
            <div style="width: 3.5rem; height: 3.5rem; background: linear-gradient(135deg, #b8e0f0, #7cc8e5); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: white; font-weight: 700; font-size: 1.5rem;">3</div>
            <h3 style="color: #1a1a1a; font-size: 1.1rem; font-weight: 600; margin: 0 0 0.75rem;">Set Budget</h3>
            <p style="color: #666666; font-size: 0.9rem; margin: 0;">Create budgets and receive alerts when approaching limits.</p>
          </div>

          <div style="text-align: center; padding: 2rem; background: white; border-radius: 1rem; border: 1px solid #d4d4d4;">
            <div style="width: 3.5rem; height: 3.5rem; background: linear-gradient(135deg, #b8e0f0, #7cc8e5); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: white; font-weight: 700; font-size: 1.5rem;">4</div>
            <h3 style="color: #1a1a1a; font-size: 1.1rem; font-weight: 600; margin: 0 0 0.75rem;">View Reports</h3>
            <p style="color: #666666; font-size: 0.9rem; margin: 0;">Analyze insights and improve your financial health.</p>
          </div>
        </div>
      </div>

      <div id="faq" style="padding: 4rem 2rem; background-color: white;">
        <h2 style="text-align: center; font-size: 2.5rem; font-weight: 700; color: #1a1a1a; margin: 0 0 0.5rem;">Frequently Asked Questions</h2>
        <p style="text-align: center; color: #666666; margin: 0 0 3rem; font-size: 1.1rem;">Find answers to common questions</p>
        
        <div style="max-width: 800px; margin: 0 auto;">
          <div style="padding: 1.5rem; background-color: #f9fafb; border-radius: 0.75rem; margin-bottom: 1.5rem; border: 1px solid #d4d4d4; cursor: pointer;" onclick="this.classList.toggle('expanded'); this.nextElementSibling.style.display = this.classList.contains('expanded') ? 'block' : 'none';">
            <p style="color: #1a1a1a; font-weight: 600; margin: 0; font-size: 1.05rem;">Is my financial data safe?</p>
          </div>
          <div style="padding: 1.5rem; background-color: #f9fafb; border-radius: 0.75rem; margin-bottom: 1.5rem; border: 1px solid #d4d4d4; display: none;">
            <p style="color: #666666; margin: 0; line-height: 1.6;">Yes, your financial data is encrypted and protected with industry-standard security. We never share your information with third parties.</p>
          </div>

          <div style="padding: 1.5rem; background-color: #f9fafb; border-radius: 0.75rem; margin-bottom: 1.5rem; border: 1px solid #d4d4d4; cursor: pointer;" onclick="this.classList.toggle('expanded'); this.nextElementSibling.style.display = this.classList.contains('expanded') ? 'block' : 'none';">
            <p style="color: #1a1a1a; font-weight: 600; margin: 0; font-size: 1.05rem;">Can I use this on mobile?</p>
          </div>
          <div style="padding: 1.5rem; background-color: #f9fafb; border-radius: 0.75rem; margin-bottom: 1.5rem; border: 1px solid #d4d4d4; display: none;">
            <p style="color: #666666; margin: 0; line-height: 1.6;">Yes, our platform is fully responsive and works seamlessly on all devices including mobile phones and tablets.</p>
          </div>

          <div style="padding: 1.5rem; background-color: #f9fafb; border-radius: 0.75rem; margin-bottom: 1.5rem; border: 1px solid #d4d4d4; cursor: pointer;" onclick="this.classList.toggle('expanded'); this.nextElementSibling.style.display = this.classList.contains('expanded') ? 'block' : 'none';">
            <p style="color: #1a1a1a; font-weight: 600; margin: 0; font-size: 1.05rem;">How do I set a budget?</p>
          </div>
          <div style="padding: 1.5rem; background-color: #f9fafb; border-radius: 0.75rem; margin-bottom: 1.5rem; border: 1px solid #d4d4d4; display: none;">
            <p style="color: #666666; margin: 0; line-height: 1.6;">Go to your dashboard, navigate to the Budget section, and enter your desired budget limit. You'll receive alerts when approaching your limit.</p>
          </div>

          <div style="padding: 1.5rem; background-color: #f9fafb; border-radius: 0.75rem; margin-bottom: 1.5rem; border: 1px solid #d4d4d4; cursor: pointer;" onclick="this.classList.toggle('expanded'); this.nextElementSibling.style.display = this.classList.contains('expanded') ? 'block' : 'none';">
            <p style="color: #1a1a1a; font-weight: 600; margin: 0; font-size: 1.05rem;">What's the Financial Health Score?</p>
          </div>
          <div style="padding: 1.5rem; background-color: #f9fafb; border-radius: 0.75rem; margin-bottom: 1.5rem; border: 1px solid #d4d4d4; display: none;">
            <p style="color: #666666; margin: 0; line-height: 1.6;">Your health score is calculated based on your savings ratio, budget control, and spending stability. It helps you understand your overall financial wellness.</p>
          </div>

          <div style="padding: 1.5rem; background-color: #f9fafb; border-radius: 0.75rem; margin-bottom: 1.5rem; border: 1px solid #d4d4d4; cursor: pointer;" onclick="this.classList.toggle('expanded'); this.nextElementSibling.style.display = this.classList.contains('expanded') ? 'block' : 'none';">
            <p style="color: #1a1a1a; font-weight: 600; margin: 0; font-size: 1.05rem;">Is there a free trial?</p>
          </div>
          <div style="padding: 1.5rem; background-color: #f9fafb; border-radius: 0.75rem; margin-bottom: 1.5rem; border: 1px solid #d4d4d4; display: none;">
            <p style="color: #666666; margin: 0; line-height: 1.6;">Yes, all users get full access to our platform free of charge. We believe financial management should be accessible to everyone.</p>
          </div>
        </div>
      </div>

      <div style="background: linear-gradient(135deg, #b8e0f0 0%, #7cc8e5 100%); padding: 4rem 2rem; text-align: center; color: white;">
        <h2 style="font-size: 2.5rem; font-weight: 700; margin: 0 0 1.5rem;">Ready to take control of your finances?</h2>
        <p style="font-size: 1.1rem; margin: 0 0 2rem; opacity: 0.95;">Join thousands of users who are managing their money smarter. Start tracking your expenses today.</p>
        <a href="/register" style="background-color: white; color: #7cc8e5; padding: 1rem 2.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; display: inline-block; transition: all 0.3s; font-size: 1.05rem;">Get Started Free</a>
      </div>

      <footer style="background-color: #1a1a1a; color: white; padding: 3rem 2rem; text-align: center;">
        <p style="margin: 0; opacity: 0.8;">© 2025 Finance Manager. All rights reserved.</p>
      </footer>
    </div>
  `
}
