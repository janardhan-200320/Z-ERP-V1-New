import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Building2,
  LogOut,
  Globe,
} from 'lucide-react';
import { useLocation } from 'wouter';

interface UserData {
  name: string;
  email: string;
  timezone: string;
  avatar?: string;
}

export default function ProfileDropdown() {
  const [, setLocation] = useLocation();

  // Fetch user data from localStorage or use mock data
  let userData: UserData = { name: 'John Doe', email: 'john.doe@example.com', timezone: 'America/New_York' };
  
  try {
    const orgData = localStorage.getItem('zervos_organization');
    if (orgData) {
      try {
        const org = JSON.parse(orgData);
        if (org && typeof org === 'object') {
          userData = {
            name: org.businessName || 'John Doe',
            email: org.email || 'john.doe@example.com',
            timezone: org.timezone || 'America/New_York',
            avatar: org.avatar || undefined,
          };
        }
      } catch {}
    }
  } catch {}

  const handleSignOut = () => {
    // Clear all keys that belong to this app's localStorage namespace
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('zervos_')) localStorage.removeItem(key);
      });
    } catch (e) {
      // fallback: try removing common keys
      localStorage.removeItem('zervos_user_session');
      localStorage.removeItem('zervos_organization');
      localStorage.removeItem('zervos_subscription');
    }

    // Navigate to the login page and reload to ensure any in-memory state is cleared
    setLocation('/login');
    // Force a hard reload so any React state/context is reset
    setTimeout(() => window.location.reload(), 50);
  };

  const handleViewOrgDetails = () => {
    setLocation('/dashboard/admin-center');
  };

  const handleMyAccount = () => {
    setLocation('/dashboard/account');
  };


  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
              <AvatarImage src={userData?.avatar} alt={userData?.name || 'User'} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {getInitials(userData?.name || 'User')}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end" forceMount>
          {/* Profile Section */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={userData?.avatar} alt={userData?.name || 'User'} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {getInitials(userData?.name || 'User')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{userData?.name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{userData?.email || 'user@example.com'}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Globe size={12} className="text-gray-400" />
                  <p className="text-xs text-gray-400">{userData?.timezone || 'UTC'}</p>
                </div>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Profile Actions */}
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleViewOrgDetails} className="cursor-pointer">
              <Building2 className="mr-2 h-4 w-4" />
              <span>View Org Details</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleMyAccount} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>My Account</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
