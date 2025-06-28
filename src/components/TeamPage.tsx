
import React, { useState } from 'react';
import { useTeamData } from '@/hooks/useTeamData';
import TeamSelector from '@/components/team/TeamSelector';
import TeamCreator from '@/components/team/TeamCreator';
import ManualScoring from '@/components/team/ManualScoring';
import TeamMembers from '@/components/team/TeamMembers';
import UsersWithoutTeam from '@/components/team/UsersWithoutTeam';

interface TeamPageProps {
  user: any;
}

const TeamPage = ({ user }: TeamPageProps) => {
  const [selectedTeam, setSelectedTeam] = useState('');
  const {
    teams,
    users,
    usersWithoutTeam,
    createTeam,
    updateUser,
    addPointsToUser,
    removeUserFromTeam,
    moveUserToTeam
  } = useTeamData();

  const getCurrentTeamMembers = () => {
    if (user.userType === 'admin') {
      return selectedTeam ? users.filter((u: any) => u.teamId === selectedTeam) : users;
    }
    return users.filter((u: any) => u.teamId === user.teamId);
  };

  const getTeamTitle = () => {
    if (user.userType === 'admin' && selectedTeam) {
      const team = teams.find((t: any) => t.id === selectedTeam);
      return `Membros - ${team?.name}`;
    }
    return 'Membros da Equipe';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Equipe</h1>
        
        {user.userType === 'admin' && (
          <div className="flex gap-3">
            <TeamSelector
              teams={teams}
              selectedTeam={selectedTeam}
              onTeamChange={setSelectedTeam}
            />
            <TeamCreator onCreateTeam={createTeam} />
          </div>
        )}
      </div>

      <ManualScoring
        teamMembers={getCurrentTeamMembers()}
        onAddPoints={addPointsToUser}
      />

      <TeamMembers
        teamMembers={getCurrentTeamMembers()}
        title={getTeamTitle()}
        onUpdateUser={updateUser}
        onRemoveUser={removeUserFromTeam}
      />

      {user.userType === 'admin' && (
        <UsersWithoutTeam
          usersWithoutTeam={usersWithoutTeam}
          teams={teams}
          onMoveUser={moveUserToTeam}
        />
      )}
    </div>
  );
};

export default TeamPage;
