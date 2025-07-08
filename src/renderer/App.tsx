import TitleBar from "./components/TitleBar/TitleBar";
import { cn } from "./utils/cn";

function App() {
  return (
    <>
      <TitleBar />
      <div className={cn("h-[calc(100vh-36px)] p-2")}>
        <h1>Bonjour monde!</h1>
      </div>
    </>
  );
}

export default App;
