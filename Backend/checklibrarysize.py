import sys

# Import the library you want to check the size of
import scikit-learn

# Get the size of the imported library
size = sys.getsizeof(sklearn)

print(f"Size of the library: {size} bytes")
