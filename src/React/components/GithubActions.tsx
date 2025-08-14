import { Upload, Download, RefreshCw } from "lucide-react";
import Button from "../Resused-Components/Button";

const GitActions: React.FC<{
  onFetch: () => void;
  onPull: () => void;
  onPush: () => void;
  disabled?: boolean;
}> = ({ onFetch, onPull, onPush, disabled = false }) => {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="secondary"
        icon={<RefreshCw />}
        onClick={onFetch}
        disabled={disabled}
      >
        Fetch
      </Button>
      <Button
        variant="primary"
        icon={<Download />}
        onClick={onPull}
        disabled={disabled}
      >
        Pull
      </Button>
      <Button
        variant="warning"
        icon={<Upload />}
        onClick={onPush}
        disabled={disabled}
      >
        Push
      </Button>
    </div>
  );
};

export default GitActions;
