import toast, { LoaderIcon } from "react-hot-toast";
import { useAuthUser } from "../hooks/useAuthUser";
import OnBoarding from "../hooks/UseOnBoarding"; // Custom hook to handle onboarding
import { useState } from "react";
import { CameraIcon, MapPinIcon, ShuffleIcon, Webhook } from "lucide-react";
import PageLoader from "../Components/PageLoader";
import { LANGUAGES } from "../constants/index"; // Assuming you have a languages.json file with language data

function OnboardingPage() {
  const { authUser } = useAuthUser();

  const [FormData, setFormData] = useState({
    //in this case the authuser.learningLanguage these all are undefined in the database afteer signup
    fullname: authUser.fullname || "",
    bio: authUser.bio || "",
    nativelanguage: authUser.nativelanguage || "",
    learninglanguage: authUser.learninglanguage || "",
    location: authUser.location || "",
    profilePic: authUser.profilePic || "",
  });

  // const queryClient = useQueryClient();
  // const { mutate: onboardingMutation, isPending } = useMutation({
  //   mutationFn: CompleteOnboarding,
  //   onSuccess: (data) => {
  //     console.log("Onboarding success:", data);
  //     toast.success("Onboarding completed successfully!");
  //     queryClient.invalidateQueries({ queryKey: ["authUser"] });
  //   },
  //   onError: (error) => {
  //     console.error(
  //       "Onboarding error:",
  //       error?.response?.data?.message || error.message
  //     );
  //     toast.error(
  //       error?.response?.data?.message || "An error occurred during onboarding."
  //     );
  //   },
  // });
  const { onboardingMutation, isPending } = OnBoarding()

  if (isPending) return <PageLoader />; // Show loading state while fetching auth data

  const handleSubmit = (e) => {
  e.preventDefault();
  console.log("Submitting FormData:", FormData);  // <--- add this
  try {
    onboardingMutation(FormData);
  }
  catch (error) {
    console.error("Error during onboarding:", error);
    toast.error(
      error?.response?.data?.message || "An error occurred during onboarding."
    );
  }

};

  const handleRandomAvatar = () => {

    const idx = Math.floor(Math.random() * 100) + 1; // 1-100 included
    const randomAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${idx}`;

    setFormData({ ...FormData, profilePic: randomAvatar });
    toast.success("Random profile picture generated!");
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
        <div className="card-body p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
            Complete Your Profile
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* PROFILE PIC CONTAINER */}
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* IMAGE PREVIEW */}
              <div className="size-32 rounded-full bg-base-300 overflow-hidden">
                {FormData.profilePic ? (
                  <img
                    src={FormData.profilePic}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <CameraIcon className="size-12 text-base-content opacity-40" />
                  </div>
                )}
              </div>
              {/* Generate Random Avatar BTN */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRandomAvatar}
                  className="btn btn-soft btn-success"
                >
                  <ShuffleIcon className="size-4 mr-2" />
                  Generate Random Avatar
                </button>
              </div>
            </div>

            {/* FULL NAME */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={FormData.fullname}
                onChange={(e) =>
                  setFormData({ ...FormData, fullname: e.target.value })
                }
                className="input input-bordered w-full"
                placeholder="Your full name"
              />
            </div>

            {/* BIO */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Bio</span>
              </label>
              <textarea
                name="bio"
                value={FormData.bio}
                onChange={(e) =>
                  setFormData({ ...FormData, bio: e.target.value })
                }
                className="textarea textarea-bordered h-24 w-full"
                placeholder="Tell others about yourself and your language learning goals"
              />
            </div>

            {/* LANGUAGES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NATIVE LANGUAGE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Native Language</span>
                </label>
                <select
                  name="nativeLanguage"
                  value={FormData.nativelanguage}
                  onChange={(e) =>
                    setFormData({ ...FormData, nativelanguage: e.target.value })
                  }
                  className="select select-bordered w-full"
                >
                  <option value="">Select your native language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`native-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* LEARNING LANGUAGE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Learning Language</span>
                </label>
                <select
                  name="learningLanguage"
                  value={FormData.learninglanguage}
                  onChange={(e) =>
                    setFormData({
                      ...FormData,
                      learninglanguage: e.target.value,
                    })
                  }
                  className="select select-bordered w-full"
                >
                  <option value="">Select language you're learning</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`learning-${lang}`} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* LOCATION */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Location</span>
              </label>
              <div className="relative">
                <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
                <input
                  type="text"
                  name="location"
                  value={FormData.location}
                  onChange={(e) =>
                    setFormData({ ...FormData, location: e.target.value })
                  }
                  className="input input-bordered w-full pl-10"
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              className="btn btn-soft btn-success w-full"
              disabled={isPending}
              type="submit"
            >
              {!isPending ? (
                <>
                  <Webhook className="size-5 mr-2" />
                  Complete Onboarding
                </>
              ) : (
                <>
                  <LoaderIcon className="animate-spin size-5 mr-2" />
                  Onboarding...
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OnboardingPage;
