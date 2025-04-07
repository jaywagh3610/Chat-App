import LeftPanel from "./LeftPanel";
import Messages from "./Messages";

function Home() {
  return (
    <div>
      <div className="flex ">
        <div className="w-[50%]">
          <LeftPanel />
        </div>
        <div className="w-[50%]">
          <Messages />
        </div>
      </div>
    </div>
  );
}

export default Home;
