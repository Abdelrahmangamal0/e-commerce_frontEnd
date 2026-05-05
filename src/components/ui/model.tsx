export const Modal = ({ children, onClose }: any) => {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="
            w-full max-w-md
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            rounded-2xl shadow-2xl
            max-h-[90vh] overflow-y-auto
          "
        >
          {children}
        </div>
      </div>
    );
  };