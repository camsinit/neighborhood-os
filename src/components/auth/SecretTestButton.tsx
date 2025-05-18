
import { useNavigate } from "react-router-dom";

/**
 * A hidden test button component that allows triggering onboarding flow
 * from any page by clicking in a specific location
 */
const SecretTestButton = () => {
  const navigate = useNavigate();

  // This invisible button is placed at the bottom left corner
  // and can be clicked to go to onboarding
  const handleClick = () => {
    navigate("/onboarding");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-4 left-4 w-4 h-4 opacity-0 hover:opacity-30 transition-opacity duration-200 z-50 bg-blue-500"
      aria-label="Test onboarding"
      title="Test onboarding flow"
    />
  );
};

export default SecretTestButton;
