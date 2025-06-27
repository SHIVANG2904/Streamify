import { useState } from "react";
import { ShipWheelIcon } from "lucide-react";
import { Link } from "react-router-dom";
import PageLoader from "../Components/PageLoader";
import useSignup from "../hooks/UseSignup"; // Custom hook to handle signup

function SignUpPage() {
  const [signupData, setSignupData] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  // const queryClient = useQueryClient();
  // const { mutate:signupMutation, isPending, error } = useMutation({
  //    mutationFn: signup, 
  //   onSuccess: (data) => {
  //     console.log("Signup success:", data); // ✅ show success info
  //     queryClient.invalidateQueries({ queryKey: ["authUser"] }); // ✅ refetch user
  //   },
  //   onError: (error) => {
  //     console.error(
  //       "Signup error:",
  //       error?.response?.data?.message || error.message
  //     );
  //   },
  // });
  const { signupMutation, isPending, error } = useSignup(); // Custom hook to handle signup

  const handlesignup = (e) => {
    e.preventDefault();
    signupMutation(signupData); // Call the signup function with the signupData
    console.log(signupData);
  };
  if (isPending) return <PageLoader />; // Show loading state while fetching auth data

  return (
    <div
      className="flex items-center justify-center h-screen p-4 sm:p-6 md:p-8"
      data-theme="forest"
    >
      <div className="border border-primary flex flex-col lg:flex-row w-full max-w-5xl mx-auto bgbg-base-100 shadow-lg rounded-xl overflow-hidden">
        {/* signup form left side */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          <div className="mb-4 flex items-center justify-start gap-2">
            <ShipWheelIcon className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Streamify
            </span>
          </div>

          {/* ERROR MESSAGE IF ANY */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error.response.data.message}</span>
            </div>
          )}
          <div className="w-full">
            <form onSubmit={handlesignup}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Create an Account</h2>
                  <p className="text-sm opacity-70">
                    Join Streamify and start your language learning adventure!
                  </p>
                </div>{" "}
                <div className="space-y-3">
                  {/* FullName */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Full Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Bhupender Jogi"
                      className="input input-bordered w-full"
                      value={signupData.fullname}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          fullname: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  {/* Email */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Bhupender@gmail.com"
                      className="input input-bordered w-full"
                      value={signupData.email}
                      onChange={(e) =>
                        setSignupData({ ...signupData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  {/* Password */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="123@abc"
                      className="input input-bordered w-full"
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                    <p className="text-xs opacity-70 mt-1">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        required
                      />
                      <span className="text-xs leading-tight">
                        I agree to the{" "}
                        <span className="text-primary hover:underline">
                          terms of service
                        </span>{" "}
                        and{" "}
                        <span className="text-primary hover:underline">
                          privacy policy
                        </span>
                      </span>
                    </label>
                  </div>
                </div>

                {/* <button
                  className="btn btn-outline btn-success w-full"
                  type="submit"
                >
                  <span className="text-sm font-semibold">
                    {isPending ? "Signing Up..." : "Create Account"}
                  </span>
                </button> */}

                <button className="btn btn-outline btn-primary w-full">
                      {
                        isPending ? (
                          <>
                            <span className="loading loading-spinner loading-xs"></span>
                            loading...
                          </>
                        ) : (
                          <span className="text-sm font-semibold">
                            Create Account
                          </span>
                        )
                      }
                </button>

                <div className="text-center mt-4">
                  <p className="text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>

              </div>
            </form>
          </div>
        </div>

        {/* SIGNUP FORM - RIGHT SIDE */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            {/* Illustration */}
            <div className="relative aspect-square max-w-sm mx-auto">
              <img
                src="/1.png"
                alt="Language connection illustration"
                className="w-full h-full"
              />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">
                Connect with language partners worldwide
              </h2>
              <p className="opacity-70">
                Practice conversations, make friends, and improve your language
                skills together
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
