import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Logo = ({ className = "h-12 cursor-pointer" }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (!user) {
      navigate('/');
      return;
    }

    // Navigate to respective dashboard based on role
    switch (user.role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'chef':
        navigate('/chef/dashboard');
        break;
      case 'user':
        navigate('/user/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <img
      src="/images/logo.png"
      alt="COL Restaurant"
      className={className}
      onClick={handleLogoClick}
    />
  );
};

export default Logo;

