document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const autocompleteList = document.getElementById("autocompleteList");
    const repositoriesList = document.getElementById("repositoriesList");

    let debounceTimeout;

    // функция для дебаунса
    const debounce = (func, delay) => {
        return (...args) => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => func(...args), delay);
        };
    };

    // функция для получения данных с апи гитхаба
    const fetchRepositories = async (query) => {
        if (!query) {
            autocompleteList.innerHTML = "";
            return;
        }

        try {
            const response = await fetch(`https://api.github.com/search/repositories?q=${query}&per_page=10`);
            if (response.ok) {
                const data = await response.json();
                displayAutocomplete(data.items);
            } else {
                console.error("Error fetching repositories:", response.status);
            }
        } catch (error) {
            console.error("Error fetching repositories:", error);
        }
    };

    // функция для отображения автокомплита
    const displayAutocomplete = (repositories) => {
        autocompleteList.innerHTML = "";
        repositories.forEach((repo) => {
            const li = document.createElement("li");
            li.textContent = repo.name;
            li.addEventListener("click", () => addRepository(repo));
            autocompleteList.appendChild(li);
        });
    };

    // функция для добавления репозитория в список
    const addRepository = (repo) => {
        // проверка на дублирование
        const existing = Array.from(repositoriesList.children).find(
            (item) => item.dataset.repoId === repo.id.toString()
        );
        if (existing) return;

        const li = document.createElement("li");
        li.dataset.repoId = repo.id;
        li.textContent = `${repo.name} by ${repo.owner.login} - ★ ${repo.stargazers_count}`;

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", () => li.remove());

        li.appendChild(removeButton);
        repositoriesList.appendChild(li);

        // очистка поля ввода
        searchInput.value = "";
        autocompleteList.innerHTML = "";
    };

    // дебаунс для обработчика ввода
    const handleInput = debounce((event) => {
        fetchRepositories(event.target.value);
    }, 500);

    // обработчик ввода для поля поиска
    searchInput.addEventListener("input", handleInput);
});
