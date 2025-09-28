import { useState, useEffect } from 'react';

// Default subject icons
export const defaultSubjectIcons = {
  databases: [
    { id: 'db-1', name: 'SQL Database', emoji: '🗄️', type: 'icon', category: 'databases' },
    { id: 'db-2', name: 'NoSQL', emoji: '📦', type: 'icon', category: 'databases' },
    { id: 'db-3', name: 'Data Warehouse', emoji: '🏢', type: 'icon', category: 'databases' },
    { id: 'db-4', name: 'Backup', emoji: '💾', type: 'icon', category: 'databases' }
  ],
  servers: [
    { id: 'server-1', name: 'Web Server', emoji: '🌐', type: 'icon', category: 'servers' },
    { id: 'server-2', name: 'API Gateway', emoji: '🛣️', type: 'icon', category: 'servers' },
    { id: 'server-3', name: 'Cloud Hosting', emoji: '☁️', type: 'icon', category: 'servers' },
    { id: 'server-4', name: 'Rack Server', emoji: '🖥️', type: 'icon', category: 'servers' }
  ],
  ai: [
    { id: 'ai-1', name: 'Neural Network', emoji: '🧠', type: 'icon', category: 'ai' },
    { id: 'ai-2', name: 'Robot', emoji: '🤖', type: 'icon', category: 'ai' },
    { id: 'ai-3', name: 'Machine Learning', emoji: '📊', type: 'icon', category: 'ai' },
    { id: 'ai-4', name: 'Chatbot', emoji: '💬', type: 'icon', category: 'ai' }
  ],
  networking: [
    { id: 'net-1', name: 'Router', emoji: '📡', type: 'icon', category: 'networking' },
    { id: 'net-2', name: 'LAN', emoji: '🔗', type: 'icon', category: 'networking' },
    { id: 'net-3', name: 'Firewall', emoji: '🛡️', type: 'icon', category: 'networking' },
    { id: 'net-4', name: 'Packet', emoji: '📦', type: 'icon', category: 'networking' }
  ],
  devops: [
    { id: 'devops-1', name: 'Container', emoji: '🐳', type: 'icon', category: 'devops' },
    { id: 'devops-2', name: 'CI/CD', emoji: '⚙️', type: 'icon', category: 'devops' },
    { id: 'devops-3', name: 'Monitoring', emoji: '📈', type: 'icon', category: 'devops' },
    { id: 'devops-4', name: 'Logs', emoji: '📜', type: 'icon', category: 'devops' }
  ]
};

// Hook for managing subject icons
export const useSubjectIcons = (workspaceId) => {
  const [icons, setIcons] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadIcons = () => {
      setIsLoading(true);
      try {
        // Try to get from localStorage
        const storedIcons = localStorage.getItem(`subject-icons-${workspaceId}`);
        if (storedIcons) {
          setIcons(JSON.parse(storedIcons));
        } else {
          setIcons(defaultSubjectIcons);
        }
      } catch (error) {
        console.error('Error loading subject icons:', error);
        setIcons(defaultSubjectIcons);
      }
      setIsLoading(false);
    };

    loadIcons();
  }, [workspaceId]);

  const addIcon = (category, iconData) => {
    const newIcon = {
      ...iconData,
      id: `${category}-${Date.now()}`,
      category: category,
      custom: true
    };

    const updatedIcons = {
      ...icons,
      [category]: [...(icons[category] || []), newIcon]
    };

    setIcons(updatedIcons);
    localStorage.setItem(`subject-icons-${workspaceId}`, JSON.stringify(updatedIcons));
    return newIcon;
  };

  const removeIcon = (category, iconId) => {
    const updatedIcons = {
      ...icons,
      [category]: (icons[category] || []).filter(icon => icon.id !== iconId)
    };

    setIcons(updatedIcons);
    localStorage.setItem(`subject-icons-${workspaceId}`, JSON.stringify(updatedIcons));
  };

  return {
    icons,
    isLoading,
    addIcon,
    removeIcon,
    categories: Object.keys(icons)
  };
};