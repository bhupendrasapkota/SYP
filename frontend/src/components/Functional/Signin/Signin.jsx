const Signin = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <form className="flex flex-col items-center justify-center w-full h-full space-y-5">
        <div className="flex flex-col items-center justify-center w-full space-y-5">
          <input
            type="text"
            placeholder="Username"
            className="w-96 h-12 px-4 border border-black focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-96 h-12 px-4 border border-black focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-96 h-12 border border-black hover:text-white hover:bg-black"
        >
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Signin;
