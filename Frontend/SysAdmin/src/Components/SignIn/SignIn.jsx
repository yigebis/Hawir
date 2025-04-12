import React from "react";
import "./SignIn.css";
import googleIcon from "../../assets/Google_Icons-09-512.png";
import hawirLogo from "../../assets/logo.jpg";

const SignIn = () => {
  return (
    <div className="container">
      {/* <div className="logo-container">
        <img src={hawirLogo} alt="SysAdmin Logo" />
        <h2>HAWIR</h2>
      </div> */}

      <h3>Welcome Back!</h3>

      <form>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="admin@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="checkbox-group">
          <input type="checkbox" id="remember" />
          <label htmlFor="remember">Remember me</label>
        </div>

        <button type="submit" className="login-button">
          Sign In
        </button>

        <div className="divider">or</div>

        <button type="button" className="google-button">
          <img src={googleIcon} alt="Google Logo" />
          Sign in with Google
        </button>
      </form>
    </div>
  );
};

export default SignIn;
