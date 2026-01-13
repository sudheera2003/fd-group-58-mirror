"use client";

import * as React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useRealTime } from "@/hooks/use-real-time";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayersIcon,
  MoreVerticalIcon,
  UserCircleIcon,
  LogOutIcon,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";



export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user: authUser } = useAuth();

  const [liveUser, setLiveUser] = React.useState({
    name: authUser?.username || "User",
    email: authUser?.email || "user@example.com",
    avatar: "/avatars/avatar-1.jpg",
    role: authUser?.role || "member",
  });

  const refreshUserData = React.useCallback(async () => {
    if (!authUser?.id) return;

    try {
      const res = await fetch(`http://localhost:5000/api/users/${authUser.id}`);
      const data = await res.json();

      if (res.ok) {
        setLiveUser({
          name: data.username,
          email: data.email,
          avatar: "/avatars/avatar-1.jpg",
          role: data.role?.name || data.role || "member",
        });
      }
    } catch (error) {
      console.error("Failed to refresh sidebar user data");
    }
  }, [authUser?.id]);

  // initial load
  React.useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  // real time listener
  useRealTime("user_update", () => {
    refreshUserData();
  });


  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/dashboard">
                <LayersIcon className="!size-5" />
                <span className="text-base font-semibold">
                  Event Managment.
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        
      </SidebarContent>
      <SidebarFooter>
        
        <NavUser user={liveUser} />
      </SidebarFooter>
    </Sidebar>
  );
}


function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLogoutOpen, setIsLogoutOpen] = React.useState(false);

  const confirmLogout = () => {
    logout();
    navigate("/login");
  };

  const editProfile = () => {
    navigate("/profile");
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg grayscale">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
                <MoreVerticalIcon className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side="right"
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">
                      {user.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={editProfile}
                  className="cursor-pointer"
                >
                  <UserCircleIcon />
                  Account
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsLogoutOpen(true)}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOutIcon />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <AlertDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}