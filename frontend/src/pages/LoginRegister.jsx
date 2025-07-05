import React, { useState } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useLanguage } from '../contexts/LanguageContext';
import { getText } from '../utils/translations';
import { apiRequest } from '../api';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react';

const LoginRegister = ({ onLoginSuccess }) => {
  const { language } = useLanguage();
  const t = (key) => getText(key, language);
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // 清除错误信息
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError(t('pleaseFillAllFields'));
      return false;
    }
    
    if (!isLogin && !formData.name) {
      setError(t('pleaseFillAllFields'));
      return false;
    }
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return false;
    }
    
    if (formData.password.length < 6) {
      setError(t('passwordTooShort'));
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(t('invalidEmail'));
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, name: formData.name };
      
      console.log('DEBUG: About to make API request to:', endpoint);
      console.log('DEBUG: Payload:', payload);
      
      const response = await apiRequest(endpoint, 'POST', payload);
      
      console.log('DEBUG: Login response received:', response);
      console.log('DEBUG: Response type:', typeof response);
      console.log('DEBUG: Response keys:', Object.keys(response));
      console.log('DEBUG: Response token:', response.token);
      console.log('DEBUG: Response user:', response.user);
      
      if (!response.token) {
        console.error('DEBUG: No token in response!');
        throw new Error('No token received from server');
      }
      
      if (!response.user) {
        console.error('DEBUG: No user data in response!');
        throw new Error('No user data received from server');
      }
      
      console.log('DEBUG: About to save to localStorage');
      console.log('DEBUG: Token to save:', response.token);
      console.log('DEBUG: User to save:', response.user);
      
      // 保存token到localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      console.log('DEBUG: localStorage after setItem - token:', localStorage.getItem('token'));
      console.log('DEBUG: localStorage after setItem - user:', localStorage.getItem('user'));
      
      // 验证保存是否成功
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      console.log('DEBUG: Verification - saved token exists:', !!savedToken);
      console.log('DEBUG: Verification - saved user exists:', !!savedUser);
      
      if (!savedToken || !savedUser) {
        console.error('DEBUG: Failed to save to localStorage!');
        throw new Error('Failed to save authentication data');
      }
      
      console.log('DEBUG: Successfully saved to localStorage, calling onLoginSuccess');
      
      // 调用父组件的登录成功回调
      onLoginSuccess(response.user);
      
    } catch (error) {
      console.error('DEBUG: Login error:', error);
      setError(error.message || t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-gray-800 border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? t('login') : t('register')}
          </h1>
          <p className="text-gray-400">
            {isLogin ? t('loginSubtitle') : t('registerSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('fullName')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t('enterFullName')}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t('enterEmail')}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={t('enterPassword')}
                className="pl-10 pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('confirmPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder={t('confirmPassword')}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/20 rounded-md text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {isLogin ? t('loggingIn') : t('registering')}
              </div>
            ) : (
              isLogin ? t('login') : t('register')
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            {isLogin ? t('noAccount') : t('haveAccount')}
            <button
              onClick={toggleMode}
              className="text-indigo-400 hover:text-indigo-300 ml-1 font-medium"
            >
              {isLogin ? t('register') : t('login')}
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LoginRegister; 