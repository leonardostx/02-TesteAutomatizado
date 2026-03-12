import { test, expect } from '@playwright/test';

test.describe('QS Acadêmico — Testes do Sistema de Notas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://leonardostx.github.io/02-TesteAutomatizado');
    // Verifica título da página em todos os testes
    await expect(page).toHaveTitle(/QS Acadêmico/);
    // Verifica que tabela inicia vazia
    await expect(page.getByText('Nenhum aluno cadastrado.')).toBeVisible();
  });

  // ========== GRUPO 1: Cadastro de Alunos ==========
  test.describe('Cadastro de Alunos', () => {
    test('deve cadastrar um aluno com dados válidos', async ({ page }) => {
      // Verifica placeholder do campo
      await expect(page.getByLabel('Nome do Aluno')).toHaveAttribute(
        'placeholder', 'Digite o nome completo'
      );

      await page.getByLabel('Nome do Aluno').fill('João Silva');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Verifica se seção cadastro está visível
      await expect(page.locator('#secao-cadastro')).toBeVisible();
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);
      await expect(page.locator('#tabela-alunos td', { hasText: 'João Silva' })).toBeVisible();
    });

    test('deve exibir mensagem de sucesso após cadastro', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Ana Costa');
      await page.getByLabel('Nota 1').fill('9');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('10');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#mensagem')).toContainText('cadastrado com sucesso');
    });

    test('não deve cadastrar aluno sem nome', async ({ page }) => {
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });
  });

  // ========== GRUPO 2: Cálculo de Média ==========
  test.describe('Cálculo de Média', () => {
    test('deve calcular a média aritmética das três notas', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Pedro Santos');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('6');
      await page.getByLabel('Nota 3').fill('10');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const celulaMedia = page.locator('#tabela-alunos tbody tr').first().locator('td').nth(4);
      await expect(celulaMedia).toHaveText('8.00');
    });
  });

  // ========== GRUPO 3: Validação de Notas ==========
  test.describe('Validação de Notas', () => {
    test('não deve aceitar nota maior que 10', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Carlos');
      await page.getByLabel('Nota 1').fill('11');
      await page.getByLabel('Nota 2').fill('5');
      await page.getByLabel('Nota 3').fill('5'); 
      
      await page.getByRole('button', { name: 'Cadastrar' }).click();
      
      await expect(page.locator('#mensagem')).toContainText('0 e 10');      await expect(page.getByText('Nenhum aluno cadastrado.')).toBeVisible();
    });

    test('não deve aceitar nota menor que 0', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Fernanda');
      await page.getByLabel('Nota 1').fill('-1');
      
      await page.getByRole('button', { name: 'Cadastrar' }).click();
      
      await expect(page.locator('#mensagem')).toContainText('0 e 10');    });
  });

  // ========== GRUPO 4: Busca por Nome ==========
  test.describe('Busca por Nome', () => {
    test('deve filtrar apenas aluno correspondente', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('João Silva');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await page.getByLabel('Nome do Aluno').fill('Maria Oliveira');
      await page.getByLabel('Nota 1').fill('9');
      await page.getByLabel('Nota 2').fill('5');
      await page.getByLabel('Nota 3').fill('8');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await page.getByLabel('Buscar').fill('João');
      
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);
      await expect(page.getByText('João Silva')).toBeVisible();
      await expect(page.getByText('Maria Oliveira')).not.toBeVisible();
    });
  });

  // ========== NOVO: Limpar Tudo com Diálogo ==========
  test.describe('Limpar Tudo', () => {
    test('deve limpar tabela após aceitar confirmação', async ({ page }) => {
      // Cadastra aluno primeiro
      await page.getByLabel('Nome do Aluno').fill('João Silva');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Configura handler ANTES de clicar no botão
      page.on('dialog', async dialog => {
        await dialog.accept(); // Clica OK
      });

      await page.getByRole('button', { name: 'Limpar Tudo' }).click();

      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(0);
      await expect(page.getByText('Nenhum aluno cadastrado.')).toBeVisible();
      await expect(page.locator('#tabela-alunos td', { hasText: 'João Silva' })).not.toBeVisible();    });

    test('não deve limpar se usuário cancelar diálogo', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('João Silva');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      page.on('dialog', async dialog => {
        await dialog.dismiss(); // Clica Cancelar
      });

      await page.getByRole('button', { name: 'Limpar Tudo' }).click();

      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);
    });
  });

  // ========== NOVO: Estatísticas Avançadas ==========
  test.describe('Estatísticas', () => {
    test('deve atualizar cards após múltiplos cadastros', async ({ page }) => {
      // 3 aprovados, 1 recuperação, 1 reprovado
      const alunos = [
        { nome: 'Aprovado1', n1: '10', n2: '8', n3: '7' },  // 8.33
        { nome: 'Aprovado2', n1: '9', n2: '9', n3: '8' },   // 8.67
        { nome: 'Recuperação', n1: '6', n2: '5', n3: '7' }, // 6.00
        { nome: 'Reprovado', n1: '3', n2: '4', n3: '5' },   // 4.00
        { nome: 'Aprovado3', n1: '10', n2: '10', n3: '7' }  // 9.00
      ];

      for (const aluno of alunos) {
        await page.getByLabel('Nome do Aluno').fill(aluno.nome);
        await page.getByLabel('Nota 1').fill(aluno.n1);
        await page.getByLabel('Nota 2').fill(aluno.n2);
        await page.getByLabel('Nota 3').fill(aluno.n3);
        await page.getByRole('button', { name: 'Cadastrar' }).click();
      }

      // Verifica contagens nos cards
      await expect(page.locator('#stat-total')).toHaveText('5');
      await expect(page.locator('[data-testid="aprovados"], .card-aprovados')).toContainText('3');
      await expect(page.locator('[data-testid="recuperacao"], .card-recuperacao')).toContainText('1');
      await expect(page.locator('[data-testid="reprovados"], .card-reprovados')).toContainText('1');
    });
  });
});
