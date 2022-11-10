(() => {
  const API = 'http://localhost:3000/api/clients';
  const API_CONTENT_TYPE = { 'content-type': 'application/json' };

  let formState = {};
  // eslint-disable-next-line no-undef
  const modal = new HystModal({
    linkAttributeName: 'data-hystmodal',
    afterClose: () => {
      // eslint-disable-next-line no-underscore-dangle
      while (modal._modalBlock.lastChild) {
      // eslint-disable-next-line no-underscore-dangle
        modal._modalBlock.lastChild.remove();
      }
      window.location.hash = '';
    },
  });

  let clientsState = [];
  const lastSorted = { sortedType: 'id', sortedStatus: 'down' };
  function createTable() {
    const table = document.createElement('table');
    table.classList.add('table', 'contacts__table', 'container');
    const tableWrapper = document.createElement('div');
    tableWrapper.classList.add('table-wrapper');
    tableWrapper.append(table);

    return { tableWrapper, table };
  }
  const table = createTable();
  function alertMessageStatus(status, statusText) {
    let statusStyle;

    switch (status) {
      case 200:
      case 201: statusStyle = { background: '#B89EFF', border: '2px solid #9873FF', color: '#fff' };
        break;
      case 404:
      default: statusStyle = { background: '#E7E5EB', border: '2px solid #F06A4D', color: '#000' };
    }

    // eslint-disable-next-line no-undef
    Toastify({
      text: statusText,
      newWindow: true,
      close: true,
      gravity: 'top',
      position: 'right',
      stopOnFocus: true,
      style: statusStyle,
    }).showToast();
  }

  async function getClientsServer() {
    const response = await fetch(API);
    if (response.ok) {
      const result = await response.json();
      return result;
    } alertMessageStatus(response.status, response.statusText);
    return null;
  }

  async function setClientsServer(data) {
    const response = await fetch(API, {
      method: 'POST',
      headers: API_CONTENT_TYPE,
      body: JSON.stringify(data),
    });
    if (response.ok) {
      const result = await response.json();
      alertMessageStatus(response.status, response.statusText);
      return result;
    } alertMessageStatus(response.status, response.statusText);
    return null;
  }

  async function getClientServer(id) {
    const response = await fetch(`${API}/${id}`);
    if (response.ok) {
      const result = await response.json();
      return result;
    } alertMessageStatus(response.status, response.statusText);
    return null;
  }

  async function deleteClientServer(id) {
    const response = await fetch(`${API}/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      const result = await response.json();
      alertMessageStatus(response.status, response.statusText);
      return result;
    } alertMessageStatus(response.status, response.statusText);
    return null;
  }

  async function changeClientServer(id, data) {
    const response = await fetch(`${API}/${id}`, {
      method: 'PATCH',
      headers: API_CONTENT_TYPE,
      body: JSON.stringify(data),
    });
    if (response.ok) {
      const result = await response.json();
      alertMessageStatus(response.status, response.statusText);
      return result;
    }
    alertMessageStatus(response.status, response.statusText);
    return null;
  }

  async function getSearchServer(value) {
    const response = await fetch(`${API}?search=${value}`);
    if (response.ok) {
      const result = await response.json();
      return result;
    } alertMessageStatus(response.status, response.statusText);
    return null;
  }

  function createValidErorrLabel(textError) {
    const span = document.createElement('span');
    span.classList.add('text', 'error-text');
    span.textContent = textError;

    return span;
  }

  function validForm(data) {
    const errorLabels = [];

    if (!data.surname.trim() || !data.name.trim()) {
      const label = createValidErorrLabel('Обязательные поля не заполнены');
      errorLabels.push(label);
    } else {
      if (data.name.trim().length < 1) {
        const label = createValidErorrLabel('Слишком короткое имя');
        errorLabels.push(label);
      } else if (data.name.split(' ').length > 1) {
        const label = createValidErorrLabel('В поле имени должно быть одно слово');
        errorLabels.push(label);
      }
      if (data.surname.trim().length < 1) {
        const label = createValidErorrLabel('Слишком короткая фамилия');
        errorLabels.push(label);
      } else if (data.surname.split(' ').length > 1) {
        const label = createValidErorrLabel('В поле фамилии должно быть одно слово');
        errorLabels.push(label);
      }
      if (data.lastName.trim().length > 0 && data.lastName.trim().length < 3) {
        const label = createValidErorrLabel('Слишком короткое отчество');
        errorLabels.push(label);
      } else if (data.lastName.split(' ').length > 1) {
        const label = createValidErorrLabel('В отчество должно быть одно слово');
        errorLabels.push(label);
      }
    }

    if (data.contacts.length) {
      data.contacts.forEach((contactObj) => {
        if (!contactObj.value.trim()) {
          const label = createValidErorrLabel(`Поле ${contactObj.type} пустое`);
          errorLabels.push(label);
        } else if ((contactObj.type === 'tel' || contactObj.type === 'otherTel') && contactObj.value.trim().length !== 10) {
          const label = createValidErorrLabel(`Поле ${contactObj.type} неполный номер контакта`);
          errorLabels.push(label);
        }
      });
    }

    return errorLabels;
  }

  function createLoader() {
    const loader = document.createElement('div');
    const image = document.createElement('img');

    loader.classList.add('loader');
    image.classList.add('loader__image');
    image.src = './img/loader.svg';
    image.alt = 'Загрузка';

    loader.append(image);

    return { loader, image };
  }
  function createClientContacts(contacts, isSorted) {
    if (!isSorted) {
      contacts.sort((a, b) => {
        if (a.type === 'tel' || b.type !== 'tel') return -1;
        if (a.type === b.type) return 0;
        if (a.type === 'othetTel') return 1;
        return 1;
      });
    }
    const firstContactsArray = contacts.length > 5 ? contacts.slice(0, 4) : false;
    const lastContactsArray = firstContactsArray ? contacts.slice(4) : false;

    const contactTypesOption = {
      tel: {
        alt: 'Позвонить',
        src: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.7"><circle cx="8" cy="8" r="8" fill="#9873FF"/><path d="M11.56 9.50222C11.0133 9.50222 10.4844 9.41333 9.99111 9.25333C9.83556 9.2 9.66222 9.24 9.54222 9.36L8.84444 10.2356C7.58667 9.63556 6.40889 8.50222 5.78222 7.2L6.64889 6.46222C6.76889 6.33778 6.80444 6.16444 6.75556 6.00889C6.59111 5.51556 6.50667 4.98667 6.50667 4.44C6.50667 4.2 6.30667 4 6.06667 4H4.52889C4.28889 4 4 4.10667 4 4.44C4 8.56889 7.43556 12 11.56 12C11.8756 12 12 11.72 12 11.4756V9.94222C12 9.70222 11.8 9.50222 11.56 9.50222Z" fill="white"/></g></svg>',
        href: 'tel:+7',
        mask: '+7 (999) 999-99-99',
      },
      othetTel: {
        alt: 'Позвонить',
        src: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8ZM9.5 6C9.5 5.17 8.83 4.5 8 4.5C7.17 4.5 6.5 5.17 6.5 6C6.5 6.83 7.17 7.5 8 7.5C8.83 7.5 9.5 6.83 9.5 6ZM5 9.99C5.645 10.96 6.75 11.6 8 11.6C9.25 11.6 10.355 10.96 11 9.99C10.985 8.995 8.995 8.45 8 8.45C7 8.45 5.015 8.995 5 9.99Z" fill="#9873FF"/></svg>',
        href: 'tel:+7',
        mask: '+7 (999) 999-99-99',
      },
      email: {
        alt: 'Написать',
        src: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM4 5.75C4 5.3375 4.36 5 4.8 5H11.2C11.64 5 12 5.3375 12 5.75V10.25C12 10.6625 11.64 11 11.2 11H4.8C4.36 11 4 10.6625 4 10.25V5.75ZM8.424 8.1275L11.04 6.59375C11.14 6.53375 11.2 6.4325 11.2 6.32375C11.2 6.0725 10.908 5.9225 10.68 6.05375L8 7.625L5.32 6.05375C5.092 5.9225 4.8 6.0725 4.8 6.32375C4.8 6.4325 4.86 6.53375 4.96 6.59375L7.576 8.1275C7.836 8.28125 8.164 8.28125 8.424 8.1275Z" fill="#9873FF"/></svg>',
        href: 'mailto:',
        mask: 'a{1,20}@a{2,10}.a{2,4}',
      },
      vk: {
        alt: 'Посетить профиль вконтакте',
        src: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.7"><path d="M8 0C3.58187 0 0 3.58171 0 8C0 12.4183 3.58187 16 8 16C12.4181 16 16 12.4183 16 8C16 3.58171 12.4181 0 8 0ZM12.058 8.86523C12.4309 9.22942 12.8254 9.57217 13.1601 9.97402C13.3084 10.1518 13.4482 10.3356 13.5546 10.5423C13.7065 10.8371 13.5693 11.1604 13.3055 11.1779L11.6665 11.1776C11.2432 11.2126 10.9064 11.0419 10.6224 10.7525C10.3957 10.5219 10.1853 10.2755 9.96698 10.037C9.87777 9.93915 9.78382 9.847 9.67186 9.77449C9.44843 9.62914 9.2543 9.67366 9.1263 9.90707C8.99585 10.1446 8.96606 10.4078 8.95362 10.6721C8.93577 11.0586 8.81923 11.1596 8.43147 11.1777C7.60291 11.2165 6.81674 11.0908 6.08606 10.6731C5.44147 10.3047 4.94257 9.78463 4.50783 9.19587C3.66126 8.04812 3.01291 6.78842 2.43036 5.49254C2.29925 5.2007 2.39517 5.04454 2.71714 5.03849C3.25205 5.02817 3.78697 5.02948 4.32188 5.03799C4.53958 5.04143 4.68362 5.166 4.76726 5.37142C5.05633 6.08262 5.4107 6.75928 5.85477 7.38684C5.97312 7.55396 6.09391 7.72059 6.26594 7.83861C6.45582 7.9689 6.60051 7.92585 6.69005 7.71388C6.74734 7.57917 6.77205 7.43513 6.78449 7.29076C6.82705 6.79628 6.83212 6.30195 6.75847 5.80943C6.71263 5.50122 6.53929 5.30218 6.23206 5.24391C6.07558 5.21428 6.0985 5.15634 6.17461 5.06697C6.3067 4.91245 6.43045 4.81686 6.67777 4.81686L8.52951 4.81653C8.82136 4.87382 8.88683 5.00477 8.92644 5.29874L8.92808 7.35656C8.92464 7.47032 8.98521 7.80751 9.18948 7.88198C9.35317 7.936 9.4612 7.80473 9.55908 7.70111C10.0032 7.22987 10.3195 6.67368 10.6029 6.09801C10.7279 5.84413 10.8358 5.58142 10.9406 5.31822C11.0185 5.1236 11.1396 5.02785 11.3593 5.03112L13.1424 5.03325C13.195 5.03325 13.2483 5.03374 13.3004 5.04274C13.6009 5.09414 13.6832 5.22345 13.5903 5.5166C13.4439 5.97721 13.1596 6.36088 12.8817 6.74553C12.5838 7.15736 12.2661 7.55478 11.9711 7.96841C11.7001 8.34652 11.7215 8.53688 12.058 8.86523Z" fill="#9873FF"/></g></svg>',
        href: 'http://',
        mask: 'vk.com/a{1,20}',
      },
      facebook: {
        alt: 'Посетить профиль фейсбук',
        src: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.7"><path d="M7.99999 0C3.6 0 0 3.60643 0 8.04819C0 12.0643 2.928 15.3976 6.75199 16V10.3775H4.71999V8.04819H6.75199V6.27309C6.75199 4.25703 7.94399 3.14859 9.77599 3.14859C10.648 3.14859 11.56 3.30121 11.56 3.30121V5.28514H10.552C9.55999 5.28514 9.24799 5.90362 9.24799 6.53815V8.04819H11.472L11.112 10.3775H9.24799V16C11.1331 15.7011 12.8497 14.7354 14.0879 13.2772C15.3261 11.819 16.0043 9.96437 16 8.04819C16 3.60643 12.4 0 7.99999 0Z" fill="#9873FF"/></g></svg>',
        href: 'http://',
        mask: 'fb.com/a{1,20}',
      },
    };
    const contactsContainer = document.createElement('div');
    contactsContainer.classList.add('client__contacts');

    function createContact(contact) {
      const link = document.createElement('a');
      link.classList.add('link', 'table__link');
      link.href = `${contactTypesOption[contact.type].href}${contact.value}`;
      link.target = '_blank';
      link.insertAdjacentHTML('afterbegin', contactTypesOption[contact.type].src);

      const content = document.createElement('span');
      content.textContent = contact.value;
      link.append(content);
      // eslint-disable-next-line no-undef
      tippy(link, {
        // eslint-disable-next-line no-undef
        content: Inputmask(contactTypesOption[contact.type].mask).mask(content).undoValue,
      });

      // link.append(img);
      contactsContainer.append(link);
    }

    if (firstContactsArray) firstContactsArray.forEach((contact) => createContact(contact));
    else contacts.forEach((contact) => createContact(contact));

    if (lastContactsArray) {
      const showeMoreBtn = document.createElement('button');
      showeMoreBtn.classList.add('btn', 'client__contacts_btn');
      showeMoreBtn.textContent = `+${lastContactsArray.length}`;
      showeMoreBtn.ariaLabel = 'Показать больше';
      showeMoreBtn.addEventListener('click', () => {
        showeMoreBtn.remove();
        lastContactsArray.forEach((contact) => createContact(contact));
      });
      contactsContainer.append(showeMoreBtn);
    }

    const td = document.createElement('td');
    td.classList.add('text', 'table__cell');
    td.append(contactsContainer);
    return td;
  }

  async function updateTable() {
    const clients = await getClientsServer();
    if (await clients) {
      clientsState = await clients;
      // eslint-disable-next-line no-use-before-define
      sortedTable(lastSorted.sortedType, lastSorted.sortedStatus, true, false);
      return table;
    }
    return null;
  }
  function addModalContent(modalContent) {
    const modalContentContainer = document.querySelector('[aria-content-modal]');
    modalContentContainer.append(modalContent.closeModalBtn, modalContent.modalWindow);
  }

  function createAlertModal() {
    const container = document.createElement('div');
    container.classList.add('modal__window', 'modal__window_alert');

    const alertContent = `
      <div class="modal__header modal__container">
        <h3 class="headline modal__headline">Удалить клиента</h3>
      </div>
      <p class="text modal__info modal__container">
        Вы действительно хотите удалить данного клиента?
      </p>
    `;

    const confirmBtn = document.createElement('button');
    confirmBtn.classList.add('btn', 'text', 'modal__btn', 'primary-btn');
    confirmBtn.setAttribute('data-hystclose', '');
    confirmBtn.textContent = 'Удалить';

    const cancelBtn = document.createElement('button');
    cancelBtn.classList.add('btn', 'text-secondary', 'modal__secendary-btn');
    cancelBtn.setAttribute('data-hystclose', '');
    cancelBtn.textContent = 'Отмена';

    container.innerHTML = alertContent;
    container.append(confirmBtn, cancelBtn);

    return new Promise((resolve) => {
      const modalContent = document.getElementById('alert-modal').querySelector('[aria-content-modal]');
      modalContent.append(container);
      confirmBtn.addEventListener('click', () => {
        resolve(true);
      });
      cancelBtn.addEventListener('click', () => {
        resolve(false);
      });
    });
  }
  async function addModalAlert(id) {
    const promiseAlert = await createAlertModal();
    if (promiseAlert) {
      await deleteClientServer(id);
    }
    updateTable();
  }
  function createModal(title, data) {
    const optionTypes = {
      tel: 'Телефон',
      othetTel: 'Доп. телефон',
      email: 'Email',
      vk: 'Vk',
      facebook: 'Facebook',
    };

    window.location.hash = data.id;

    const inputs = [];
    let contacts = [];
    const isData = Boolean(Object.keys(data).length);
    const isDraft = Boolean(!data.id);
    const form = document.createElement('form');
    form.classList.add('modal__form');
    form.method = 'post';

    function generateData() {
      const inputValues = {};
      inputs.forEach((element) => {
        inputValues[element.name] = element.value.trim();
      });
      const contactsValues = [];
      contacts.forEach((contactObj) => {
        if (contactObj.select.value === 'tel' || contactObj.select.value === 'othetTel') {
          contactsValues.push({
            type: contactObj.select.value,
            value: contactObj.input.inputmask.unmaskedvalue().trim(),
          });
          return;
        }
        contactsValues.push({
          type: contactObj.select.value,
          value: contactObj.input.value.trim(),
        });
      });
      const formData = {
        ...inputValues,
        contacts: contactsValues,
      };
      return formData;
    }

    function createAddContactGroup(type = 'tel', value = '') {
      const containerGroup = document.createElement('div');
      containerGroup.classList.add('add-contact__group');

      const select = document.createElement('select');
      select.name = 'type';

      let thisContact;

      const clearInputBtn = document.createElement('button');
      const input = document.createElement('input');
      input.classList.add('text', 'input', 'add-contact__input');
      input.type = 'text';
      input.name = 'value';
      input.value = value;
      input.placeholder = window.innerWidth <= 380 ? 'Введите данные' : 'Введите данные контакта';
      input.addEventListener('input', () => {
        if (input.value) containerGroup.append(clearInputBtn);
        else clearInputBtn.remove();
      });
      window.addEventListener('resize', () => {
        if (window.innerWidth <= 380) input.placeholder = 'Введите данные';
        else input.placeholder = 'Введите данные контакта';
      });

      clearInputBtn.classList.add('btn', 'add-contact_clear');
      clearInputBtn.insertAdjacentHTML('afterbegin', '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_121_1495)"><path d="M8 2C4.682 2 2 4.682 2 8C2 11.318 4.682 14 8 14C11.318 14 14 11.318 14 8C14 4.682 11.318 2 8 2ZM8 12.8C5.354 12.8 3.2 10.646 3.2 8C3.2 5.354 5.354 3.2 8 3.2C10.646 3.2 12.8 5.354 12.8 8C12.8 10.646 10.646 12.8 8 12.8ZM10.154 5L8 7.154L5.846 5L5 5.846L7.154 8L5 10.154L5.846 11L8 8.846L10.154 11L11 10.154L8.846 8L11 5.846L10.154 5Z" fill="#B0B0B0"/></g><defs><clipPath id="clip0_121_1495"><rect width="16" height="16" fill="white"/></clipPath></defs></svg>');
      clearInputBtn.addEventListener('click', (el) => {
        if (!el.metaKey) {
          containerGroup.remove();
          contacts.splice(contacts.indexOf(thisContact), 1);
        }
        if (el.metaKey) {
          input.value = '';
        }
      });

      const inputMasksOption = {
        // eslint-disable-next-line no-undef
        tel: () => { Inputmask('+7 (999) 999-99-99').mask(input); },
        // eslint-disable-next-line no-undef
        othetTel: () => { Inputmask('+7 (999) 999-99-99').mask(input); },
        // eslint-disable-next-line no-undef
        email: () => { Inputmask('a{1,20}@a{2,10}.a{2,4}').mask(input); },
        // eslint-disable-next-line no-undef
        vk: () => { Inputmask('vk.com/a{1,20}').mask(input); },
        // eslint-disable-next-line no-undef
        facebook: () => { Inputmask('fb.com/a{1,20}').mask(input); },
      };

      Object.keys(optionTypes).forEach((optionType) => {
        const option = document.createElement('option');
        option.value = optionType;
        option.innerHTML = optionTypes[optionType];
        option.selected = !!(isData && type === optionType);
        select.append(option);
      });

      containerGroup.append(select, input);
      if (input.value) {
        containerGroup.append(clearInputBtn);
        // // eslint-disable-next-line no-undef
        // tippy(clearInputBtn, {
        //   // eslint-disable-next-line no-undef
        //   content: 'Удалить контакт',
        //   followCursor: true,
        // });
      }
      thisContact = { select, input };
      contacts.push(thisContact);

      // eslint-disable-next-line no-undef
      const selectChoices = new Choices(select, {
        searchEnabled: false,
        shouldSortItems: false,
        itemSelectText: '',
        allowHTML: true,
      });

      inputMasksOption[type]();
      selectChoices.passedElement.element.addEventListener('choice', (el) => inputMasksOption[el.detail.choice.value]());

      return containerGroup;
    }

    const inputLabels = {
      Фамилия: { label: 'surname', requared: true },
      Имя: { label: 'name', requared: true },
      Отчество: { label: 'lastName', requared: false },
    };
    const modalWindow = document.createElement('div');
    modalWindow.classList.add('modal__window');
    const idClient = isData && Boolean(data.id) ? `<span class="text-secondary modal__client-id">ID:&nbsp;${data.id}</span>` : '';
    const modalHeader = `
      <div class="modal__header modal__container">
        <h3 class="headline modal__headline">${title}</h3>
        ${idClient}
      </div>
    `;

    const submitBtn = document.createElement('button');
    submitBtn.classList.add('btn', 'text', 'modal__btn', 'primary-btn');
    submitBtn.textContent = 'Сохранить';

    const addContactContainer = document.createElement('div');
    addContactContainer.classList.add('add-contact', 'text');

    const addContactGroupContainer = document.createElement('div');
    addContactGroupContainer.classList.add('add-contact__container');

    const addContactBtn = document.createElement('button');
    addContactBtn.classList.add('btn', 'modal__add-contact_btn');
    addContactBtn.textContent = 'Добавить контакт';
    addContactBtn.addEventListener('click', () => {
      if (contacts.length < 10) addContactGroupContainer.append(createAddContactGroup());
      else {
        // eslint-disable-next-line no-undef
        Toastify({
          text: 'Больше 10 полей добавить нельзя',
          newWindow: true,
          close: true,
          gravity: 'top',
          position: 'right',
          stopOnFocus: true,
        }).showToast();
      }
    });
    addContactContainer.append(addContactGroupContainer, addContactBtn);

    if (isData) {
      if (data.contacts.length) {
        data.contacts.forEach((contactObj) => {
          addContactGroupContainer.append(createAddContactGroup(contactObj.type, contactObj.value));
        });
      }
    }

    const errorContainer = document.createElement('div');
    errorContainer.classList.add('error-container');

    const closeModalBtn = document.createElement('button');
    closeModalBtn.classList.add('btn', 'modal__close-btn');
    closeModalBtn.textContent = 'Закрыть';
    closeModalBtn.addEventListener('click', (el) => {
      if (!data.id) {
        const formData = generateData();
        formState = formData;
      }
      if (el.metaKey && !data.id) formState = {};
      modal.close();
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.classList.add('btn', 'text-secondary', 'modal__cancel-btn');
    cancelBtn.textContent = data.id ? 'Удалить клиента' : 'Отмена';
    cancelBtn.addEventListener('click', async () => {
      if (cancelBtn.textContent === 'Отмена') {
        formState = {};
        modal.close();
      }
      if (cancelBtn.textContent === 'Удалить клиента') {
        modal.open('#alert-modal');
        await addModalAlert(data.id);
        updateTable();
      }
    });

    Object.keys(inputLabels).forEach((titleLabel) => {
      const label = document.createElement('label');
      const span = document.createElement('span');
      span.classList.add('label__text');
      span.textContent = titleLabel;
      const input = document.createElement('input');

      label.classList.add('modal__label', 'modal__container');
      label.getAttribute('for', inputLabels[titleLabel.label]);

      input.classList.add('text', 'input', 'modal__input');
      input.id = inputLabels[titleLabel].label;
      input.name = inputLabels[titleLabel].label;
      input.type = 'text';
      if (isData) {
        input.value = data[inputLabels[titleLabel].label];
        span.classList.add('label__text_active');
      }
      input.addEventListener('focusin', () => {
        // eslint-disable-next-line no-undef
        Inputmask(
          {
            regex: '^[А-Я]{1}[а-я]{1,20}',
            placeholder: '',
            onincomplete: () => input.classList.add('modal__input_invalid'),
            oncomplete: () => input.classList.remove('modal__input_invalid'),
            oncleared: () => input.classList.add('modal__input_invalid'),
          },
        ).mask(input);
        if (!input.value) span.classList.add('label__text_active');
      });
      input.addEventListener('focusout', () => {
        if (!input.value) span.classList.remove('label__text_active');
      });

      label.append(span, input);

      form.append(label);

      if (inputLabels[titleLabel].requared) span.classList.add('modal__label_requared');

      inputs.push(input);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
    });

    submitBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      submitBtn.classList.add('modal__btn_loader');
      function resetStateForm() {
        formState = {};
        // eslint-disable-next-line no-param-reassign
        inputs.forEach((input) => { input.value = ''; });
        contacts = [];
      }
      // TODO Добавить функцию валидации и проверять данные при изменении и при добавлении
      const formData = generateData();
      const validate = validForm(formData);
      if (!isDraft) {
        const response = await changeClientServer(data.id, formData);
        if (response) {
          resetStateForm();
          modal.close();
        }
      } else {
        while (errorContainer.childNodes.length) {
          errorContainer.lastChild.remove();
        }
        if (validate.length) {
          validate.forEach((errorLabel) => {
            errorContainer.append(errorLabel);
          });
        } else {
          const responseSetData = await setClientsServer(formData);
          if (responseSetData) {
            resetStateForm();
            while (addContactGroupContainer.childNodes.length) {
              addContactGroupContainer.lastChild.remove();
            }
          }
        }
      }
      submitBtn.classList.remove('modal__btn_loader');
      updateTable();
    });

    form.append(addContactContainer, errorContainer, submitBtn, cancelBtn);
    modalWindow.innerHTML = modalHeader;
    modalWindow.append(form);

    return { modalWindow, closeModalBtn };
  }

  function createTbody(clients, isUpdate = false, isSorted = false) {
    function createTableRow(client) {
      const updateDate = new Date(client.updatedAt);
      const updateDateYMD = client.updatedAt.split('T').shift().split('-').join('.');
      const createdDate = new Date(client.createdAt);
      const createdDateYMD = client.createdAt.split('T').shift().split('-').join('.');
      const contacts = createClientContacts(client.contacts, isSorted);
      const actionBtnClasses = ['btn', 'text', 'action__btn'];
      const tr = document.createElement('tr');
      tr.classList.add('table__row', 'client');
      tr.id = client.id;

      const tdClientAction = document.createElement('td');
      tdClientAction.classList.add('text', 'table__cell');
      const changeBtn = document.createElement('button');
      changeBtn.classList.add(...actionBtnClasses, 'action__btn_change');
      changeBtn.textContent = 'Изменить';
      changeBtn.addEventListener('click', async () => {
        const changeBtnClasses = ['loader-btn', 'loader-btn_change'];
        changeBtn.classList.add(...changeBtnClasses);
        const clientData = await getClientServer(client.id);
        if (clientData) {
          modal.open('#modal');
          const modalContent = createModal('Изменить данные', clientData);
          addModalContent(modalContent);
          changeBtn.classList.remove(...changeBtnClasses);
        }
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add(...actionBtnClasses, 'action__btn_delete');
      deleteBtn.textContent = 'Удалить';
      deleteBtn.addEventListener('click', async () => {
        modal.open('#alert-modal');
        const deleteBtnClasses = ['loader-btn', 'loader-btn_del'];
        deleteBtn.classList.add(...deleteBtnClasses);
        await addModalAlert(client.id);
        deleteBtn.classList.remove(...deleteBtnClasses);
      });
      tdClientAction.append(changeBtn, deleteBtn);

      const tableRowsBase = `
        <td class="text-secondary table__cell client__id">${client.id.substring(client.id.length - 6, client.id.length)}</td>
        <td class="text table__cell client__name">${client.surname} ${client.name} ${client.lastName}</td>
        <td class="text table__cell">${createdDateYMD} <span class="table__time">${createdDate.toString().split(' ')[4].substring(0, 5)}</span></td>
        <td class="text table__cell">${updateDateYMD} <span class="table__time">${updateDate.toString().split(' ')[4].substring(0, 5)}</span></td>
      `;

      tr.innerHTML = tableRowsBase;
      tr.append(contacts, tdClientAction);

      return tr;
    }

    if (isUpdate) document.querySelector('.table__body').remove();
    const tbody = document.createElement('tbody');
    tbody.classList.add('table__body');
    clients.forEach((client) => {
      tbody.append(createTableRow(client));
    });
    return tbody;
  }

  function creatSearchForm() {
    const form = document.createElement('form');
    const searchInput = document.createElement('input');
    let timerId = 1;
    form.classList.add('form', 'header__form');
    searchInput.classList.add('text', 'input', 'header__input');
    searchInput.type = 'search';
    searchInput.name = 'search';
    searchInput.placeholder = 'Введите запрос';

    const ul = document.createElement('ul');
    ul.classList.add('list', 'form__list');

    async function search(searchValue) {
      const found = await getSearchServer(searchValue);
      found.forEach((contact) => {
        const li = document.createElement('li');
        li.classList.add('item', 'form__item');

        const link = document.createElement('a');
        link.classList.add('link', 'text', 'form__link');
        link.textContent = `${contact.surname} ${contact.name} ${contact.lastName}`;
        link.href = `#${contact.id}`;
        link.addEventListener('click', () => {
          document.getElementById(contact.id).classList.remove('is-focused');
          document.getElementById(contact.id).classList.add('is-focused');
          setTimeout(() => {
            document.getElementById(contact.id).classList.remove('is-focused');
          }, 1000);
        });
        li.append(link);
        ul.append(li);
      });
      ul.classList.add('is-found');
    }
    searchInput.addEventListener('input', () => {
      while (ul.childNodes.length) ul.lastChild.remove();
      if (searchInput.value) {
        clearInterval(timerId);
        timerId = setTimeout(search, 600, searchInput.value);
      }
      ul.classList.remove('is-found');
    });

    form.append(searchInput, ul);

    return {
      form,
      searchInput,
    };
  }

  function sortedTable(sortedType, sortedStatus, isUpdate = true, isSorted = true) {
    const sortedOption = {
      id: {
        up: (a, b) => b.id - a.id,
        down: (a, b) => a.id - b.id,
      },
      fullName: {
        up: (a, b) => {
          if (`${a.surname} ${a.name} ${a.lastName}` > `${b.surname} ${b.name} ${b.lastName}`) return 1;
          if (`${a.surname} ${a.name} ${a.lastName}` === `${b.surname} ${b.name} ${b.lastName}`) return 0;
          return -1;
        },
        down: (a, b) => {
          if (`${a.surname} ${a.name} ${a.lastName}` > `${b.surname} ${b.name} ${b.lastName}`) return -1;
          if (`${a.surname} ${a.name} ${a.lastName}` === `${b.surname} ${b.name} ${b.lastName}`) return 0;
          return 1;
        },
      },
      dateTimeCreate: {
        up: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        down: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      },
      dateTimeChange: {
        up: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
        down: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
      },
    };
    clientsState.sort((a, b) => sortedOption[sortedType][sortedStatus](a, b));
    const tbody = createTbody(clientsState, isUpdate, isSorted);
    table.table.append(tbody);
  }

  function createThead() {
    const headers = {
      ID: { sorted: 'id', sortedStatus: 'up' },
      'Фамилия Имя Отчество': { sorted: 'fullName', sortedStatus: 'down' },
      'Дата и время создания': { sorted: 'dateTimeCreate', sortedStatus: 'down' },
      'Последние изменения': { sorted: 'dateTimeChange', sortedStatus: 'down' },
      Контакты: false,
      Действия: false,
    };
    const thClasses = ['text-secondary', 'table__headline'];
    const textClass = 'table__sorted-headline';
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    thead.classList.add('table__header');
    tr.classList.add('table__row');

    Object.keys(headers).forEach((header) => {
      const th = document.createElement('th');
      th.classList.add(...thClasses);
      const tableHeadline = document.createElement('span');
      tableHeadline.classList.add(textClass);
      tableHeadline.textContent = header;

      if (headers[header]) {
        tableHeadline.setAttribute('data-sorted', headers[header].sorted);
        tableHeadline.setAttribute('data-sorted-status', headers[header].sortedStatus);
        tableHeadline.addEventListener('click', () => {
          if (lastSorted.lastElement) lastSorted.lastElement.classList.remove('is-sorted');
          tableHeadline.classList.add('is-sorted');
          lastSorted.sortedStatus = tableHeadline.getAttribute('data-sorted-status');
          lastSorted.sortedType = tableHeadline.getAttribute('data-sorted');
          lastSorted.lastElement = tableHeadline;
          sortedTable(lastSorted.sortedType, lastSorted.sortedStatus);
          if (tableHeadline.getAttribute('data-sorted-status') === 'up') tableHeadline.setAttribute('data-sorted-status', 'down');
          else tableHeadline.setAttribute('data-sorted-status', 'up');
        });
      }
      th.append(tableHeadline);
      tr.append(th);
    });

    thead.append(tr);

    return thead;
  }

  function creatAddClientBtn() {
    const container = document.createElement('div');
    const button = document.createElement('button');
    const textBtn = document.createElement('span');

    container.classList.add('add-client', 'container');
    button.classList.add('btn', 'add-client__btn', 'secondary-btn');
    button.insertAdjacentHTML(
      'afterbegin',
      '<svg width="23" height="16" viewBox="0 0 23 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 8C16.71 8 18.5 6.21 18.5 4C18.5 1.79 16.71 0 14.5 0C12.29 0 10.5 1.79 10.5 4C10.5 6.21 12.29 8 14.5 8ZM5.5 6V3H3.5V6H0.5V8H3.5V11H5.5V8H8.5V6H5.5ZM14.5 10C11.83 10 6.5 11.34 6.5 14V16H22.5V14C22.5 11.34 17.17 10 14.5 10Z" fill="#9873FF"/></svg>',
    );
    textBtn.classList.add('text', 'add-client__btn_text');
    textBtn.textContent = 'Добавить клиента';

    button.setAttribute('data-hystmodal', '#modal');

    button.append(textBtn);
    container.append(button);

    return {
      container,
      button,
    };
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const app = document.getElementById('app');
    if (window.localStorage.getItem('isOneOpen') === null) {
      modal.open('#totorial');
      window.localStorage.setItem('isOneOpen', 'fasle');
    }
    if (window.location.hash && window.location.hash !== '#undefined') {
      const clientData = await getClientServer(window.location.hash.split('#').pop());
      if (clientData) {
        addModalContent(createModal('Изменить данные', clientData));
        modal.open('#modal');
      }
    }
    const search = creatSearchForm();
    document.querySelector('.header').append(search.form);
    table.table.append(createThead());
    const loaderObj = createLoader();
    document.querySelector('.logo').addEventListener('click', () => {
      if (window.innerWidth <= 380) {
        search.form.classList.toggle('form-is-active');
      }
    });
    const addClient = creatAddClientBtn();
    addClient.button.addEventListener('click', () => {
      const modalContent = createModal('Новый клиент', formState);
      addModalContent(modalContent);
    });

    app.append(table.tableWrapper, loaderObj.loader);
    const data = await getClientsServer();
    if (data) {
      clientsState = await data;
      sortedTable(lastSorted.sortedType, lastSorted.sortedStatus, false, false);
      const sortedHeadline = document.querySelector(`[data-sorted="${lastSorted.sortedType}"]`);
      sortedHeadline.classList.add('is-sorted');
      lastSorted.lastElement = sortedHeadline;
      loaderObj.loader.remove();
      app.append(addClient.container);
    }
  });
})();
