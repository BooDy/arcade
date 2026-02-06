---
description: How to deploy the Arcade app to your VPS
---

Since you have already cloned the repository on your VPS, deploying is straightforward using Docker Compose.

1.  **Navigate to the project directory**:
    ```bash
    cd arcade
    ```

2.  **Pull the latest changes** (if you made updates locally):
    ```bash
    git pull
    ```

3.  **Build and run the container**:
    ```bash
    docker-compose up -d --build
    ```
    - `-d` runs the container in detached mode (in the background).
    - `--build` ensures the image is rebuilt with any new changes.

4.  **Verify the deployment**:
    Check if the container is running:
    ```bash
    docker ps
    ```
    You should see `arcade-hub` running on port 8080.

5.  **Access the app**:
    Open your browser and navigate to `http://<your-vps-ip>:8080`.

### Troubleshooting

-   **Port Conflicts**: If port 8080 is already in use, edit `docker-compose.yml` and change `"8080:80"` to a different port, e.g., `"8081:80"`.
-   **Logs**: To view logs, run `docker-compose logs -f`.

---

### Production Setup (Domain & Persistence)

#### 1. Keep App Running After Reboot
Your `docker-compose.yml` is already configured with `restart: always`. This ensures that if your server reboots or the container crashes, Docker will automatically start the app again. No extra action is needed.

#### 2. Configure a Subdomain (Reverse Proxy with Apache)
To use a domain like `arcade.yourdomain.com` instead of `IP:8080`, you should use Apache on your host machine as a reverse proxy.

1.  **Point your Domain**:
    Go to your DNS provider (GoDaddy, Cloudflare, etc.) and create an **A Record**:
    -   **Name**: `arcade` (for `arcade.yourdomain.com`)
    -   **Value**: Your VPS IP address

2.  **Enable Proxy Modules**:
    Ensure the necessary Apache modules are enabled:
    ```bash
    sudo a2enmod proxy
    sudo a2enmod proxy_http
    sudo systemctl restart apache2
    ```

3.  **Configure Apache**:
    Create a new virtual host configuration:
    ```bash
    sudo nano /etc/apache2/sites-available/arcade.conf
    ```
    Paste the following config:
    ```apache
    <VirtualHost *:80>
        ServerName arcade.yourdomain.com  # <--- Replace with your domain

        ProxyPreserveHost On
        ProxyPass / http://localhost:8080/
        ProxyPassReverse / http://localhost:8080/

        ErrorLog ${APACHE_LOG_DIR}/arcade-error.log
        CustomLog ${APACHE_LOG_DIR}/arcade-access.log combined
    </VirtualHost>
    ```

4.  **Enable the Site**:
    ```bash
    sudo a2ensite arcade.conf
    sudo systemctl reload apache2
    ```

### Troubleshooting

-   **Invalid command 'ProxyPreserveHost'**: This means the `proxy` module is not loaded. Run:
    ```bash
    sudo a2enmod proxy proxy_http
    sudo systemctl restart apache2
    ```
    Note that `restart` is often required when enabling new modules, `reload` might not be enough.
