## Trello ##
Para este projeto funcionar corretamente é necessário que os cartões do Trello estejam parametrizados corretamente.

1. Deve ser definido uma etiqueta com uma cor para cada situação.

   Ex.: 
   
        Cards não começados - Preto
   
        Cards com erros     - Vermelho
        
        Cards concluído     - Verde

2. Os cartões deverão ter checklists.

3. O sistema tem três classificações para os itens dos checklists.
   * Item não marcado = "A fazer".
   * Item não marcado e contendo algum Emoji (por padrão o emoji é warning :warning:) = "Pendentes".
   * Item marcado = "Concluídos".

4. A quantidade de correções/erros será igual a quantidade de comentários nos cartões.

   Ex.: Card 1
      
        Para criar uma correção para card 1, basta apenas adicionar um comentário sobre a correção no card.
      
5. Obtendo o json do trello.
   - Clicar no botão "... Mostrar Menu" no canto superior direito;
   - Clicar em "... Mais";
   - Clicar em "Imrpimir e Exportar";
   - Clicar em "Exportar JSON".
