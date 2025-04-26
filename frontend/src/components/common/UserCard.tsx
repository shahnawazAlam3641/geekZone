import { useNavigate } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import { User } from "../../store/slices/authSlice";

interface UserCardProps {
  user: User;
}

export default function UserCard({ user }: UserCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/profile/${user._id}`)}
      className="flex items-center gap-4 p-4  rounded-xl hover:bg-primary cursor-pointer transition-all shadow-sm hover:shadow-md card "
    >
      <img
        src={
          user.profilePicture ||
          `https://api.dicebear.com/5.x/initials/svg?seed=${user?.username}`
        }
        alt={user.username}
        className="w-12 h-12 rounded-full object-cover border border-border"
      />
      <div className="flex flex-col overflow-hidden ">
        <div className="flex items-center gap-1">
          <p className="font-semibold text-base overflow-hidden text-ellipsis">
            {user.username}
          </p>
          {user.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
        </div>
        <p className="text-sm text-muted-foreground overflow-hidden text-ellipsis">
          {user.email}
        </p>
      </div>
    </div>
  );
}
