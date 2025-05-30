Feature: Utilização de Dados Dinâmicos
  Demonstra o uso de dados de usuários gerados dinamicamente em cenários BDD.

  Scenario: Registrar múltiplos usuários dinâmicos a partir de arquivo
    Given o arquivo de dados de usuários dinâmicos "dynamic-users.json" está disponível
    When eu processo o registro para cada usuário dinâmico contido no arquivo
    Then cada tentativa de registro de usuário dinâmico do arquivo deve ser reportada como processada
