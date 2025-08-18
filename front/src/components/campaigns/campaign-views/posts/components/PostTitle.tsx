interface PostTitleProps {
  title: string | null;
}

export const PostTitle = ({ title }: PostTitleProps) => {
  return (
    <div className="px-1 py-0.5 h-6 flex items-center">
      {title ? (
        <p className="text-xs text-gray-700 leading-tight truncate w-full">
          {title}
        </p>
      ) : (
        <div className="h-3"></div>
      )}
    </div>
  );
}; 