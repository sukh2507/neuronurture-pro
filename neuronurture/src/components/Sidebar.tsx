
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  menuItems: Array<{ id: string; label: string; icon: any }>;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ activeTab, setActiveTab, menuItems, isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
     <div className={`
  fixed top-0 left-0 h-full w-64 bg-white shadow-xl border-r border-pink-100 z-50 transform transition-transform duration-300 ease-in-out overflow-y-hidden
  ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  lg:translate-x-0
`}>
        <div className="p-6 border-b border-pink-100">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-full">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              NeuroNurture
            </span>
          </div>
        </div>

        <nav className="p-4 space-y-1.5 flex-1 overflow-y-hidden">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                  : 'text-gray-700 hover:bg-pink-50'
              }`}
              onClick={() => {
                setActiveTab(item.id);
                onClose();
              }}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="-mt-7 p-4 flex-shrink-0">
    <Button
      variant="outline"
      className="w-full border-pink-200 text-pink-600 hover:bg-pink-50"
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  </div>

      </div>
    </>
  );
};

export default Sidebar;
