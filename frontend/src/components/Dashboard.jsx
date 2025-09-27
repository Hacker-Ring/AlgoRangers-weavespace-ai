// components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import WorkspaceSidebar from './WorkspaceSidebar';
import WorkspaceView from './WorkspaceView';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import JoinWorkspaceModal from './JoinWorkspaceModal';

const Dashboard = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://algorangers-weavespace-ai.onrender.com/api/workspaces/my-workspaces', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data.workspaces);
        
        if (!selectedWorkspace && data.workspaces.length > 0) {
          setSelectedWorkspace(data.workspaces[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (workspaceData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://algorangers-weavespace-ai.onrender.com/api/workspaces', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workspaceData)
      });

      if (response.ok) {
        const data = await response.json();
        setWorkspaces(prev => [data.workspace, ...prev]);
        setSelectedWorkspace(data.workspace);
        setShowCreateModal(false);
        alert(`Workspace created! Share this code to invite others: ${data.workspace.code}`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error creating workspace:', error);
      alert('Failed to create workspace');
    }
  };

  const handleJoinWorkspace = async (code) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://algorangers-weavespace-ai.onrender.com/api/workspaces/join', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });

      if (response.ok) {
        const data = await response.json();
        setWorkspaces(prev => [data.workspace, ...prev]);
        setSelectedWorkspace(data.workspace);
        setShowJoinModal(false);
        alert('Successfully joined workspace!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error joining workspace:', error);
      alert('Failed to join workspace');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your workspaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <WorkspaceSidebar
        workspaces={workspaces}
        selectedWorkspace={selectedWorkspace}
        onSelectWorkspace={setSelectedWorkspace}
        onCreateWorkspace={() => setShowCreateModal(true)}
        onJoinWorkspace={() => setShowJoinModal(true)}
      />
      
      <div className="flex-1 flex flex-col">
        {selectedWorkspace ? (
          // <WorkspaceView workspace={selectedWorkspace} />
          <WorkspaceView workspace={selectedWorkspace}/>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Whiteboard</h1>
              <p className="text-gray-600 mb-8">
                Create a new workspace or join an existing one to start collaborating.
              </p>
              <div className="space-x-4">
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  onClick={() => setShowCreateModal(true)}
                >
                  Create Workspace
                </button>
                <button 
                  className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                  onClick={() => setShowJoinModal(true)}
                >
                  Join Workspace
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        // <CreateWorkspaceModal
        //   onClose={() => setShowCreateModal(false)}
        //   onCreate={handleCreateWorkspace}
        // />
        <CreateWorkspaceModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateWorkspace}
        />

      )}

      {showJoinModal && (
        // <JoinWorkspaceModal
        //   onClose={() => setShowJoinModal(false)}
        //   onJoin={handleJoinWorkspace}
        // />
        <JoinWorkspaceModal
          onClose={() => setShowJoinModal(false)}
          onJoin={handleJoinWorkspace}
        />
      )}
    </div>
  );
};

export default Dashboard;