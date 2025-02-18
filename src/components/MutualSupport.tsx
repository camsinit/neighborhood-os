
import MutualSupportContainer from "./mutual-support/MutualSupportContainer";
import { ViewType } from "./mutual-support/types";

// Props interface to define the expected props
interface MutualSupportProps {
  view?: ViewType;
}

// Component that handles mutual support functionality (goods exchange, care support, etc)
const MutualSupport = ({ view }: MutualSupportProps) => {
  return <MutualSupportContainer selectedView={view} />;
};

export default MutualSupport;
