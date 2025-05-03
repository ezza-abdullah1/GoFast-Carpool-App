import React from 'react';
import SignIn from './SignIn';
import SignUp from './SignUp';
import { useAuthModal } from './AuthModalContext';

const AuthModal = () => {
  const { isOpen, authMode, closeModal, switchToSignIn, switchToSignUp } = useAuthModal();

  if (!isOpen) return null;

  return authMode === 'signin' ? (
    <SignIn onSwitchToSignUp={switchToSignUp} onClose={closeModal} />
  ) : (
    <SignUp onSwitchToSignIn={switchToSignIn} onClose={closeModal} />
  );
};

export default AuthModal;
