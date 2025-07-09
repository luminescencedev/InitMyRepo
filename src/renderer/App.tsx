import TitleBar from "./components/TitleBar/TitleBar";
import { cn } from "./utils/cn";

function App() {
  return (
    <>
      <TitleBar />
      <div className={cn("h-[calc(100vh-36px)] w-screen flex flex-row")}></div>
    </>
  );
}

export default App;
