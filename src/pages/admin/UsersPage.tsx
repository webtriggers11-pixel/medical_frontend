import { useUsers } from '../../features/users/hooks/useUsers';

export const UsersPage = () => {
  const { data: users, isLoading, error } = useUsers();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Users</h1>
      <p className="text-slate-500 mb-8">Manage all platform users</p>

      {isLoading && <p className="text-slate-500">Loading users...</p>}
      {error && <p className="text-red-500">Failed to load users</p>}

      {users && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Email</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Role</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-900">{user.email}</td>
                  <td className="px-5 py-3">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
