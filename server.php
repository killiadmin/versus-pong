<?php
require 'vendor/autoload.php';

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class PongServer implements MessageComponentInterface {
    private SplObjectStorage $clients;
    private int $playerCount = 0;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
    }

    public function onOpen(ConnectionInterface $conn): void
    {
        $this->clients->attach($conn);
        $this->playerCount++;

        $role = $this->playerCount === 1 ? 'player1' : 'player2';
        $conn->send(json_encode(['role' => $role], JSON_THROW_ON_ERROR));

        echo "Nouvelle connexion : {$conn->resourceId} (Rôle : $role)\n";
    }

    public function onMessage(ConnectionInterface $from, $msg): void
    {
        foreach ($this->clients as $client) {
            if ($from !== $client) {
                $client->send($msg);
            }
        }
    }

    public function onClose(ConnectionInterface $conn): void
    {
        $this->clients->detach($conn);
        $this->playerCount--;
        echo "Connexion fermée : {$conn->resourceId}\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e): void
    {
        echo "Erreur : {$e->getMessage()}\n";
        $conn->close();
    }
}

$port = 8080;
$address = '127.0.0.1';

$server = new Ratchet\App($address, $port, '0.0.0.0');
$server->route('/pong', new PongServer, ['*']);
$server->run();
