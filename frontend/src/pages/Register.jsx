import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register/', formData);
      navigate('/login');
    } catch {
      setError('Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        value={formData.username}
        onChange={(event) => setFormData({ ...formData, username: event.target.value })}
        placeholder="Username"
        required
      />
      <input
        value={formData.email}
        onChange={(event) => setFormData({ ...formData, email: event.target.value })}
        placeholder="Email"
        type="email"
        required
      />
      <input
        value={formData.password}
        onChange={(event) => setFormData({ ...formData, password: event.target.value })}
        placeholder="Password"
        type="password"
        required
      />
      <button disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
      {error && <p>{error}</p>}
    </form>
  );
};

export default Register;
