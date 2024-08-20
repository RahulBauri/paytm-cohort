import axios from 'axios';
import Appbar from '../components/Appbar';
import Balance from '../components/Balance';
import Users from '../components/Users';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BACKEND_PROD_URL } from '../config';

const Dashboard = () => {
  const [balance, setBalance] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBalance = async () => {
      const response = await axios.get(
        `${BACKEND_PROD_URL}/api/v1/account/balance`,
        {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token'),
          },
        }
      );
      setBalance(response.data.balance);
    };

    if (localStorage.getItem('token') === null) {
      return;
    }

    fetchBalance();
  }, []);

  if (localStorage.getItem('token') === null) {
    return <h1>you are not authorized to access this page yet!!</h1>;
  }

  return (
    <div>
      <Appbar username={localStorage.getItem('username')} />
      <div className='m-8'>
        <Balance value={balance} />
        <Users />
      </div>
    </div>
  );
};

export default Dashboard;
