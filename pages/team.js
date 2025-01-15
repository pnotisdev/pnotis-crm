import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function TeamPage() {
  const [team, setTeam] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    try {
      const response = await fetch('/api/team', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTeam(data);
      } else {
        throw new Error('Failed to fetch team data');
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
    }
  };

  if (!team) return <div>Loading...</div>;

  return (
    <div>
      <h1>{team.name}</h1>
      <h2>Team Members:</h2>
      <ul>
        {team.members.map(member => (
          <li key={member.id}>{member.name} ({member.email})</li>
        ))}
      </ul>
      {/* Add forms for inviting new members, etc. */}
    </div>
  );
}
