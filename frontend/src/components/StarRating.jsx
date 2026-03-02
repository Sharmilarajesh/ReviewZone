const StarRating = ({ rating, onRate, readonly = false, size = "text-2xl" }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center space-x-1">
      {stars.map((star) => (
        <button
          key={star}
          onClick={() => !readonly && onRate?.(star)}
          className={`${size} ${
            !readonly && 'cursor-pointer hover:scale-110 transition-transform'
          }`}
          disabled={readonly}
          type="button"
        >
          <span className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
};

export default StarRating;