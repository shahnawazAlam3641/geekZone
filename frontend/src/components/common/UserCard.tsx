// components/UserCard.tsx
// import { User } from "@/types";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useNavigate } from "react-router";

interface UserCardProps {
  user: User;
}

export default function UserCard({ user }: UserCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/profile/${user._id}`)}
      className="flex items-center gap-3 p-2 group rounded-lg hover:bg-muted transition cursor-pointer"
    >
      <div className="w-10 h-10">
        <img
          className="rounded-full aspect-square object-cover"
          src={
            user.profilePicture ||
            `https://api.dicebear.com/5.x/initials/svg?seed=${user?.username}`
          }
        />
      </div>
      <div>
        <p className="font-medium text-sm group-hover:underline">
          {user.username}
        </p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>
    </div>
  );
}
