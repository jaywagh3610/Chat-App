import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./utils/AuthProvider";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { lazy, Suspense } from "react";
import { ChatProvider } from "./utils/ChatProvider";
import { MessageProvider } from "./utils/MessageProvider";
import { SearchProvider } from "./utils/SearchProvider";
import { SocketIoProvider } from "./utils/SocketIoProvider";
const Register = lazy(() => import("./components/Register"));
const Nav = lazy(() => import("./components/Nav"));
const Home = lazy(() => import("./components/Home"));
const Login = lazy(() => import("./components/Login"));

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<p>Loading...</p>}>
        <AuthProvider>
          <SocketIoProvider>
            <ChatProvider>
              <MessageProvider>
                <SearchProvider>
                  <BrowserRouter>
                    <Nav />
                    <Routes>
                      <Route index path="/" element={<Home />} />
                      <Route path="/registration" element={<Register />} />
                      <Route path="/login" element={<Login />} />
                    </Routes>
                  </BrowserRouter>
                  <Toaster
                    position="top-center"
                    containerStyle={{ marginTop: "80px", margin: "8px" }}
                    toastOptions={{
                      success: {
                        duration: 3000,
                      },
                      error: {
                        duration: 5000,
                      },
                      style: {
                        fontSize: "16px",
                        maxWidth: "500px",
                        padding: "16px 24px",
                        backgroundColor: "white",
                        color: "var(--color-grey-700)",
                      },
                    }}
                  />
                </SearchProvider>
              </MessageProvider>
            </ChatProvider>
          </SocketIoProvider>
        </AuthProvider>
      </Suspense>
    </QueryClientProvider>
  );
}

export default App;
