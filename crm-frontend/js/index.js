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
    table.classList.add('table', 'contacts__table');

    return table;
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
    const firstContactsArray = contacts.length > 5 ? contacts.slice(0, 5) : false;
    const lastContactsArray = firstContactsArray ? contacts.slice(5) : false;

    const contactTypesOption = {
      tel: {
        alt: 'Позвонить',
        src: './img/contact-info-phone.svg',
        href: 'tel:+7',
        mask: '+7 (999) 999-99-99',
      },
      othetTel: {
        alt: 'Позвонить',
        src: './img/contact-info-other.svg',
        href: 'tel:+7',
        mask: '+7 (999) 999-99-99',
      },
      email: {
        alt: 'Написать',
        src: './img/contact-info-email.svg',
        href: 'mailto:',
        mask: 'a{1,20}@a{2,10}.a{2,4}',
      },
      vk: {
        alt: 'Посетить профиль вконтакте',
        src: './img/contact-info-vk.svg',
        href: 'http://',
        mask: 'vk.com/a{1,20}',
      },
      facebook: {
        alt: 'Посетить профиль фейсбук',
        src: './img/contact-info-fb.svg',
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
      link.textContent = contact.value;

      const img = document.createElement('img');
      img.classList.add('table__image');
      img.src = contactTypesOption[contact.type].src;
      img.alt = contactTypesOption[contact.type].alt;

      // eslint-disable-next-line no-undef
      tippy(link, {
        // eslint-disable-next-line no-undef
        content: Inputmask(contactTypesOption[contact.type].mask).mask(link).undoValue,
      });

      link.append(img);
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
    confirmBtn.classList.add('btn', 'text', 'modal__btn');
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
      input.addEventListener('input', () => {
        if (input.value) containerGroup.append(clearInputBtn);
        else clearInputBtn.remove();
      });

      const clearInputBtnImage = document.createElement('img');
      clearInputBtn.classList.add('btn', 'add-contact_clear');
      clearInputBtnImage.src = './img/delete-btn-secondary.svg';
      clearInputBtnImage.alt = 'Очистить поле';
      clearInputBtn.append(clearInputBtnImage);
      clearInputBtn.addEventListener('click', (el) => {
        input.value = '';
        if (el.metaKey) {
          containerGroup.remove();
          contacts.splice(contacts.indexOf(thisContact), 1);
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
      if (input.value) containerGroup.append(clearInputBtn);
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
    const idClient = isData && Boolean(data.id) ? `<span class="text-secondary modal__client-id">ID: ${data.id}</span>` : '';
    const modalHeader = `
      <div class="modal__header modal__container">
        <h3 class="headline modal__headline">${title}</h3>
        ${idClient}
      </div>
    `;

    const submitBtn = document.createElement('button');
    submitBtn.classList.add('btn', 'text', 'modal__btn');
    submitBtn.textContent = 'Сохранить';

    const addContactContainer = document.createElement('div');
    addContactContainer.classList.add('add-contact');

    const addContactGroupContainer = document.createElement('div');
    addContactGroupContainer.classList.add('modal__container');

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
    cancelBtn.textContent = isData && Boolean(data.id) ? 'Удалить клиента' : 'Отменить';
    cancelBtn.addEventListener('click', async () => {
      if (cancelBtn.textContent === 'Отменить') {
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
      function resetStateForm() {
        formState = {};
        // eslint-disable-next-line no-param-reassign
        inputs.forEach((input) => { input.value = ''; });
        contacts = [];
      }
      const formData = generateData();
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

        const validate = validForm(formData);
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
          const modalContent = createModal('Изменить контакт', clientData);
          addModalContent(modalContent);
          changeBtn.classList.remove(...changeBtnClasses);
        }
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add(...actionBtnClasses, 'action__btn_delete');
      deleteBtn.textContent = 'Удалить';
      deleteBtn.addEventListener('click', async () => {
        modal.open('#alert-modal');
        const deleteBtnClasses = ['loader-btn', 'loader-btn_change'];
        deleteBtn.classList.add(...deleteBtnClasses);
        await addModalAlert(client.id);
        deleteBtn.classList.remove(...deleteBtnClasses);
      });
      tdClientAction.append(changeBtn, deleteBtn);

      const tableRowsBase = `
        <td class="text-secondary table__cell client__id">${client.id}</td>
        <td class="text table__cell client__name">${client.surname} ${client.name} ${client.lastName}</td>
        <td class="text table__cell">${createdDateYMD} <span class="table__time">${createdDate.getHours()}:${createdDate.getMinutes()}</span></td>
        <td class="text table__cell">${updateDateYMD} <span class="table__time">${updateDate.getHours()}:${updateDate.getMinutes()}</span></td>
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
        // link.href = `#${contact.id}`;
        link.addEventListener('click', () => {
          addModalContent(createModal('Клиент', contact));
          modal.open('#modal');
        });
        li.append(link);
        ul.append(li);
      });
      ul.classList.add('is-found');
    }
    searchInput.addEventListener('input', () => {
      if (searchInput.value) {
        while (ul.childNodes.length) {
          ul.lastChild.remove();
        }
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
    table.append(tbody);
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
          lastSorted.sortedStatus = tableHeadline.getAttribute('data-sorted-status');
          lastSorted.sortedType = tableHeadline.getAttribute('data-sorted');
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

    container.classList.add('add-client');
    button.classList.add('btn', 'add-client__btn');
    textBtn.classList.add('text', 'add-client__btn_text');
    textBtn.textContent = 'Добавить контакт';

    button.setAttribute('data-hystmodal', '#modal');

    button.append(textBtn);
    container.append(button);

    return {
      container,
      button,
    };
  }

  document.addEventListener('DOMContentLoaded', async () => {
    if (window.localStorage.getItem('isOneOpen') === null) {
      modal.open('#totorial');
      window.localStorage.setItem('isOneOpen', 'fasle');
    }
    if (window.location.hash) {
      const clientData = await getClientServer(window.location.hash.split('#').pop());
      if (clientData) {
        addModalContent(createModal('Изменить контакт', clientData));
        modal.open('#modal');
      }
    }
    const search = creatSearchForm();
    document.querySelector('.header').append(search.form);
    table.append(createThead());
    const loaderObj = createLoader();

    const addClient = creatAddClientBtn();
    addClient.button.addEventListener('click', () => {
      const modalContent = createModal('Новый клиент', formState);
      addModalContent(modalContent);
    });

    document.getElementById('app').append(table, loaderObj.loader, addClient.container);
    const data = await getClientsServer();
    if (data) {
      clientsState = await data;
      sortedTable(lastSorted.sortedType, lastSorted.sortedStatus, false, false);
      loaderObj.loader.remove();
    }
  });
})();
