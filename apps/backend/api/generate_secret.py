import base64
import hashlib
import hmac
import argparse

parser = argparse.ArgumentParser(description="Generate a secret key for a user.")
parser.add_argument("username", type=str, help="The username of the user.")
parser.add_argument("client_id", type=str, help="The client ID.")
parser.add_argument("client_secret", type=str, help="The client secret.")
args = parser.parse_args()

def generate_secret(username: str, client_id: str, client_secret: str) -> str:
    """Generate a secret key for a user based on their username, client ID, and client secret."""
    return base64.b64encode(hmac.new(bytes(client_secret, 'utf-8'), bytes(
    username + client_id, 'utf-8'), digestmod=hashlib.sha256).digest()).decode()


# args: username, client_id, client_secret
if __name__ == "__main__":
    # Example usage
    secret = generate_secret(args.username, args.client_id, args.client_secret)
    print(f"Generated secret: {secret}")