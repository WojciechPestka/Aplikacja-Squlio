import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Activation.css";
import './Background.css';

const Activation = () => {
  const [activationCode, setActivationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const navigate = useNavigate();

  const handleActivationClick = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        setError("Brak autoryzacji. Zaloguj się ponownie.");
        setLoading(false);
        return;
      }

      const response = await fetch('https://squlio.edu.pl/api/activation', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ activationKey: activationCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        localStorage.setItem("isActivated", "true"); 
        navigate("/characterBuild"); 
      } else {
        setError(data.message || 'Błąd aktywacji. Spróbuj ponownie.');
      }
    } catch (error) {
      console.error('Wystąpił błąd podczas aktywacji:', error);
      setError('Wystąpił błąd podczas aktywacji.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="activation-container">
      <div className="background"></div>
      <div className="activation-box">
        <h2>AKTYWACJA</h2>
        <p>Wprowadz kod aktywacyjny, który wysłaliśmy Ci na maila.</p>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">Kod aktywacyjny został przyjęty!</p>}
        <input
          type="text"
          placeholder="Kod"
          value={activationCode}
          onChange={(e) => setActivationCode(e.target.value)}
          className="activation-input"
        />
        <button onClick={handleActivationClick} className="activation-button" disabled={loading}>
          {loading ? 'Ładowanie...' : 'AKTYWUJ'}
        </button>
        <p className="activation-footer">Gotowi na dobrą zabawę?</p>
      </div>
    </div>
  );
};

export default Activation;
