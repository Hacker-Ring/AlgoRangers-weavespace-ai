import React, { useState, useEffect } from 'react';
import { useSubjectIcons } from '../data/subjectIcons';

const SubjectIconsPanel = ({
  isVisible,
  onClose,
  workspaceId,
  onIconSelect,
  canvasSize
}) => {
  const { icons, isLoading, categories, addIcon, removeIcon } = useSubjectIcons(workspaceId);
  const [activeCategory, setActiveCategory] = useState(categories[0] || 'math');
  const [showAddIconModal, setShowAddIconModal] = useState(false);
  const [newIcon, setNewIcon] = useState({ name: '', emoji: '', type: 'icon' });

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  if (!isVisible) return null;

  const handleIconClick = (icon) => {
    // Use relative coordinates (0-1 range) for consistency with your system
    const x = 0.3; // Center of canvas (30% from left)
    const y = 0.3; // Center of canvas (30% from top)

    onIconSelect({
      ...icon,
      x,
      y,
      width: 100,
      height: 100,
      fontSize: icon.type === 'text' ? 24 : 48
    });
  };

  const handleAddIcon = () => {
    if (newIcon.name && newIcon.emoji) {
      addIcon(activeCategory, newIcon);
      setNewIcon({ name: '', emoji: '', type: 'icon' });
      setShowAddIconModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed left-20 top-1/2 transform -translate-y-1/2 w-80 bg-white shadow-xl rounded-lg border border-gray-200 z-40">
        <div className="p-4">Loading icons...</div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed left-20 top-1/2 transform -translate-y-1/2 w-80 bg-white shadow-xl rounded-lg border border-gray-200 z-40 max-h-96">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Subject Icons</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAddIconModal(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Add Custom Icon"
            >
              <span className="text-lg">+</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-lg">×</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex-1 px-4 py-2 text-sm font-medium capitalize transition-colors ${
                activeCategory === category
                  ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Icons Grid */}
        <div className="p-4 max-h-64 overflow-y-auto">
          <div className="grid grid-cols-4 gap-3">
            {(icons[activeCategory] || []).map(icon => (
              <button
                key={icon.id}
                onClick={() => handleIconClick(icon)}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group relative"
                title={icon.name}
              >
                <span className="text-2xl mb-1">{icon.emoji}</span>
                <span className="text-xs text-gray-600 truncate w-full text-center">
                  {icon.name}
                </span>

                {icon.custom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeIcon(activeCategory, icon.id);
                    }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                )}
              </button>
            ))}
          </div>

          {(!icons[activeCategory] || icons[activeCategory].length === 0) && (
            <div className="text-center text-gray-500 py-8">
              No icons available for {activeCategory}
            </div>
          )}
        </div>
      </div>

      {/* Add Icon Modal */}
      {showAddIconModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add Custom Icon</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon Name
                </label>
                <input
                  type="text"
                  value={newIcon.name}
                  onChange={(e) => setNewIcon(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter icon name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emoji/Text
                </label>
                <input
                  type="text"
                  value={newIcon.emoji}
                  onChange={(e) => setNewIcon(prev => ({ ...prev, emoji: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter emoji or text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newIcon.type}
                  onChange={(e) => setNewIcon(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="icon">Icon</option>
                  <option value="text">Text</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddIconModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddIcon}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Icon
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubjectIconsPanel;