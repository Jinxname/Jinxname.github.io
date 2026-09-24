(function () {

    let initialized = false;
    let parsedData = null;

    // =====================================================
    // 初始化
    // =====================================================

    function initCurlBatchTool() {

        if (initialized) {
            return;
        }

        const curlInput =
            document.getElementById("curlInput");

        if (!curlInput) {
            return;
        }

        initialized = true;

        const parseButton =
            document.getElementById("parseCurlButton");

        const clearButton =
            document.getElementById("clearCurlButton");

        const previewButton =
            document.getElementById("previewBatchButton");

        const startButton =
            document.getElementById("startBatchButton");

        if (parseButton) {
            parseButton.addEventListener(
                "click",
                parseCurl
            );
        }

        if (clearButton) {
            clearButton.addEventListener(
                "click",
                clearCurl
            );
        }

        if (previewButton) {
            previewButton.addEventListener(
                "click",
                previewBatch
            );
        }

        if (startButton) {
            startButton.addEventListener(
                "click",
                startBatch
            );
        }

        curlInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.ctrlKey &&
                    event.key === "Enter"
                ) {
                    event.preventDefault();
                    parseCurl();
                }
            }
        );
    }


    // =====================================================
    // 解析 Curl
    // =====================================================

    function parseCurl() {

        const input =
            document.getElementById("curlInput");

        if (!input) {
            return;
        }

        let curlText =
            input.value.trim();

        if (!curlText) {
            showMessage(
                "请先粘贴 Curl 请求",
                "error"
            );
            return;
        }

        try {

            curlText =
                normalizeCurl(curlText);

            parsedData =
                parseCurlText(curlText);

            renderParsedData();

            clearBatchPreview();
            clearBatchResults();

            showMessage(
                "Curl 解析成功",
                "success"
            );

        } catch (error) {

            console.error(
                "Curl 解析失败：",
                error
            );

            showMessage(
                "Curl 解析失败：" +
                error.message,
                "error"
            );
        }
    }


    // =====================================================
    // Curl 标准化
    // =====================================================

    function normalizeCurl(curlText) {

        let text =
            curlText
                .replace(/\r\n/g, "\n")
                .replace(/\r/g, "\n");

        // 去掉行尾反斜杠
        text =
            text.replace(
                /\\\s*\n/g,
                " "
            );

        return text.trim();
    }


    // =====================================================
    // Curl Token 解析
    // =====================================================

    function tokenizeCurl(text) {

        const tokens = [];

        let current = "";

        let quote = null;

        let escaped = false;

        for (
            let i = 0;
            i < text.length;
            i++
        ) {

            const char =
                text[i];

            if (escaped) {

                current += char;
                escaped = false;

                continue;
            }

            if (char === "\\") {

                escaped = true;

                continue;
            }

            if (
                quote === "'" ||
                quote === '"'
            ) {

                if (char === quote) {

                    quote = null;

                } else {

                    current += char;
                }

                continue;
            }

            if (
                char === "'" ||
                char === '"'
            ) {

                quote = char;

                continue;
            }

            if (/\s/.test(char)) {

                if (current) {

                    tokens.push(current);
                    current = "";
                }

                continue;
            }

            current += char;
        }

        if (escaped) {
            current += "\\";
        }

        if (current) {
            tokens.push(current);
        }

        return tokens;
    }


    // =====================================================
    // 解析 Curl
    // =====================================================

    function parseCurlText(curlText) {

        const tokens =
            tokenizeCurl(curlText);

        if (!tokens.length) {
            throw new Error(
                "Curl 内容为空"
            );
        }

        let index = 0;

        if (
            tokens[0].toLowerCase() ===
            "curl"
        ) {
            index = 1;
        }

        let method = "GET";

        let url = "";

        const headers = {};

        let body = "";

        let bodyType = "";

        let explicitMethod = false;

        while (
            index < tokens.length
        ) {

            const token =
                tokens[index];

            // -------------------------------------------------
            // URL
            // -------------------------------------------------

            if (
                !token.startsWith("-") &&
                !url
            ) {

                url = token;

                index++;

                continue;
            }


            // -------------------------------------------------
            // -X / --request
            // -------------------------------------------------

            if (
                token === "-X" ||
                token === "--request"
            ) {

                method =
                    (
                        tokens[index + 1] ||
                        "GET"
                    ).toUpperCase();

                explicitMethod = true;

                index += 2;

                continue;
            }


            // -------------------------------------------------
            // -H / --header
            // -------------------------------------------------

            if (
                token === "-H" ||
                token === "--header"
            ) {

                const headerValue =
                    tokens[index + 1] || "";

                parseHeader(
                    headerValue,
                    headers
                );

                index += 2;

                continue;
            }


            // -------------------------------------------------
            // --url
            // -------------------------------------------------

            if (
                token === "--url"
            ) {

                url =
                    tokens[index + 1] || "";

                index += 2;

                continue;
            }


            // -------------------------------------------------
            // --data
            // --data-raw
            // --data-binary
            // --data-urlencode
            // -d
            // -------------------------------------------------

            if (
                token === "-d" ||
                token === "--data" ||
                token === "--data-raw" ||
                token === "--data-binary" ||
                token === "--data-urlencode"
            ) {

                const data =
                    tokens[index + 1] || "";

                body =
                    body
                        ? body + "&" + data
                        : data;

                if (
                    token ===
                    "--data-urlencode"
                ) {
                    bodyType = "form";
                }

                index += 2;

                if (!explicitMethod) {
                    method = "POST";
                }

                continue;
            }


            // -------------------------------------------------
            // --form / -F
            // -------------------------------------------------

            if (
                token === "-F" ||
                token === "--form"
            ) {

                const formValue =
                    tokens[index + 1] || "";

                body =
                    body
                        ? body + "&" + formValue
                        : formValue;

                bodyType = "form";

                index += 2;

                if (!explicitMethod) {
                    method = "POST";
                }

                continue;
            }


            // -------------------------------------------------
            // --get
            // -------------------------------------------------

            if (
                token === "--get"
            ) {

                method = "GET";

                index++;

                continue;
            }


            // -------------------------------------------------
            // 忽略 Curl 常见参数
            // -------------------------------------------------

            if (
                token === "-s" ||
                token === "-S" ||
                token === "-sS" ||
                token === "-L" ||
                token === "--location" ||
                token === "-k" ||
                token === "--insecure" ||
                token === "-v" ||
                token === "--verbose" ||
                token === "--compressed"
            ) {

                index++;

                continue;
            }


            // -------------------------------------------------
            // 未知参数
            // -------------------------------------------------

            if (
                token.startsWith("-")
            ) {

                index++;

                continue;
            }

            index++;
        }

        if (!url) {

            throw new Error(
                "未解析到请求 URL"
            );
        }

        const queryParams =
            parseQueryParams(url);

        const bodyParams =
            parseBodyParams(
                body,
                headers,
                bodyType
            );

        return {
            method: method,
            url: url,
            headers: headers,
            body: body,
            bodyType: bodyType,
            queryParams: queryParams,
            bodyParams: bodyParams
        };
    }


    // =====================================================
    // Header 解析
    // =====================================================

    function parseHeader(
        headerText,
        headers
    ) {

        const separatorIndex =
            headerText.indexOf(":");

        if (
            separatorIndex === -1
        ) {
            return;
        }

        const name =
            headerText
                .substring(
                    0,
                    separatorIndex
                )
                .trim();

        const value =
            headerText
                .substring(
                    separatorIndex + 1
                )
                .trim();

        if (!name) {
            return;
        }

        headers[name] = value;
    }


    // =====================================================
    // Query 参数解析
    // =====================================================

    function parseQueryParams(url) {

        const result = [];

        try {

            const urlObject =
                new URL(url);

            urlObject.searchParams.forEach(
                function (value, key) {

                    result.push({
                        type: "query",
                        name: key,
                        value: value
                    });
                }
            );

        } catch (error) {

            const questionIndex =
                url.indexOf("?");

            if (
                questionIndex !== -1
            ) {

                const queryString =
                    url.substring(
                        questionIndex + 1
                    );

                queryString
                    .split("&")
                    .forEach(
                        function (item) {

                            if (!item) {
                                return;
                            }

                            const parts =
                                item.split("=");

                            const key =
                                decodeURIComponent(
                                    parts.shift() || ""
                                );

                            const value =
                                decodeURIComponent(
                                    parts.join("=") || ""
                                );

                            if (key) {

                                result.push({
                                    type: "query",
                                    name: key,
                                    value: value
                                });
                            }
                        }
                    );
            }
        }

        return result;
    }


    // =====================================================
    // Body 参数解析
    // =====================================================

    function parseBodyParams(
        body,
        headers,
        bodyType
    ) {

        if (!body) {
            return [];
        }

        const contentType =
            getHeaderValue(
                headers,
                "Content-Type"
            );

        // JSON
        if (
            bodyType === "json" ||
            contentType
                .toLowerCase()
                .includes("application/json") ||
            isJson(body)
        ) {

            try {

                const json =
                    JSON.parse(body);

                return flattenObject(
                    json
                );

            } catch (error) {

                return [];
            }
        }

        // Form
        if (
            bodyType === "form" ||
            contentType
                .toLowerCase()
                .includes(
                    "application/x-www-form-urlencoded"
                )
        ) {

            return parseFormBody(body);
        }

        return [];
    }


    // =====================================================
    // 判断 JSON
    // =====================================================

    function isJson(value) {

        if (
            typeof value !== "string"
        ) {
            return false;
        }

        const text =
            value.trim();

        if (
            !(
                text.startsWith("{") ||
                text.startsWith("[")
            )
        ) {
            return false;
        }

        try {

            JSON.parse(text);

            return true;

        } catch (error) {

            return false;
        }
    }


    // =====================================================
    // JSON 参数展开
    // =====================================================

    function flattenObject(
        object,
        prefix = ""
    ) {

        const result = [];

        if (
            object === null ||
            object === undefined
        ) {
            return result;
        }

        if (
            typeof object !== "object"
        ) {

            if (prefix) {

                result.push({
                    type: "body",
                    name: prefix,
                    path: prefix,
                    value: object
                });
            }

            return result;
        }

        if (Array.isArray(object)) {

            object.forEach(
                function (item, index) {

                    const path =
                        prefix
                            ? prefix +
                              "[" +
                              index +
                              "]"
                            : "[" +
                              index +
                              "]";

                    result.push(
                        ...flattenObject(
                            item,
                            path
                        )
                    );
                }
            );

            return result;
        }

        Object.keys(object)
            .forEach(
                function (key) {

                    const path =
                        prefix
                            ? prefix +
                              "." +
                              key
                            : key;

                    const value =
                        object[key];

                    if (
                        value !== null &&
                        typeof value === "object"
                    ) {

                        result.push(
                            ...flattenObject(
                                value,
                                path
                            )
                        );

                    } else {

                        result.push({
                            type: "body",
                            name: key,
                            path: path,
                            value: value
                        });
                    }
                }
            );

        return result;
    }


    // =====================================================
    // Form 参数解析
    // =====================================================

    function parseFormBody(body) {

        const result = [];

        body
            .split("&")
            .forEach(
                function (item) {

                    if (!item) {
                        return;
                    }

                    const parts =
                        item.split("=");

                    const name =
                        decodeURIComponent(
                            parts.shift() || ""
                        );

                    const value =
                        decodeURIComponent(
                            parts.join("=") || ""
                        );

                    if (name) {

                        result.push({
                            type: "body",
                            name: name,
                            path: name,
                            value: value
                        });
                    }
                }
            );

        return result;
    }


    // =====================================================
    // 获取 Header
    // =====================================================

    function getHeaderValue(
        headers,
        targetName
    ) {

        const target =
            targetName.toLowerCase();

        const key =
            Object.keys(headers)
                .find(
                    function (name) {

                        return (
                            name.toLowerCase() ===
                            target
                        );
                    }
                );

        return key
            ? headers[key]
            : "";
    }


    // =====================================================
    // 渲染解析结果
    // =====================================================

    function renderParsedData() {

        if (!parsedData) {
            return;
        }

        const resultCard =
            document.getElementById(
                "curlParseResult"
            );

        if (resultCard) {
            resultCard.classList.remove(
                "hidden"
            );
        }

        const methodElement =
            document.getElementById(
                "parsedMethod"
            );

        const urlElement =
            document.getElementById(
                "parsedUrl"
            );

        if (methodElement) {
            methodElement.textContent =
                parsedData.method;
        }

        if (urlElement) {
            urlElement.textContent =
                parsedData.url;
        }

        renderHeaders();

        renderQueryParams();

        renderBodyParams();

        renderBatchParameters();
    }


    // =====================================================
    // Headers
    // =====================================================

    function renderHeaders() {

        const container =
            document.getElementById(
                "parsedHeaders"
            );

        if (!container) {
            return;
        }

        container.innerHTML = "";

        const keys =
            Object.keys(
                parsedData.headers
            );

        if (!keys.length) {

            container.innerHTML =
                emptyHtml(
                    "无 Header 参数"
                );

            return;
        }

        keys.forEach(
            function (key) {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "curl-param-item";

                item.innerHTML = `
                    <div class="curl-param-name">
                        ${escapeHtml(key)}
                    </div>

                    <div class="curl-param-value">
                        ${escapeHtml(
                            parsedData.headers[key]
                        )}
                    </div>
                `;

                container.appendChild(item);
            }
        );
    }


    // =====================================================
    // Query
    // =====================================================

    function renderQueryParams() {

        const container =
            document.getElementById(
                "parsedQueryParams"
            );

        if (!container) {
            return;
        }

        container.innerHTML = "";

        if (
            !parsedData.queryParams.length
        ) {

            container.innerHTML =
                emptyHtml(
                    "无 Query 参数"
                );

            return;
        }

        parsedData.queryParams.forEach(
            function (param) {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "curl-param-item";

                item.innerHTML = `
                    <div class="curl-param-name">
                        ${escapeHtml(
                            param.name
                        )}
                    </div>

                    <div class="curl-param-value">
                        ${escapeHtml(
                            String(param.value)
                        )}
                    </div>
                `;

                container.appendChild(item);
            }
        );
    }


    // =====================================================
    // Body
    // =====================================================

    function renderBodyParams() {

        const container =
            document.getElementById(
                "parsedBodyParams"
            );

        if (!container) {
            return;
        }

        container.innerHTML = "";

        if (
            !parsedData.bodyParams.length
        ) {

            if (parsedData.body) {

                const pre =
                    document.createElement(
                        "pre"
                    );

                pre.className =
                    "batch-detail-pre";

                pre.textContent =
                    formatResponseBody(
                        parsedData.body
                    );

                container.appendChild(pre);

            } else {

                container.innerHTML =
                    emptyHtml(
                        "无 Body 参数"
                    );
            }

            return;
        }

        parsedData.bodyParams.forEach(
            function (param) {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "curl-param-item";

                item.innerHTML = `
                    <div class="curl-param-name">
                        ${escapeHtml(
                            param.path ||
                            param.name
                        )}
                    </div>

                    <div class="curl-param-value">
                        ${escapeHtml(
                            String(param.value)
                        )}
                    </div>
                `;

                container.appendChild(item);
            }
        );
    }


    // =====================================================
    // 批量参数
    // =====================================================

    function renderBatchParameters() {

        const container =
            document.getElementById(
                "batchParameterList"
            );

        if (!container) {
            return;
        }

        container.innerHTML = "";

        const parameters = [];

        parsedData.queryParams.forEach(
            function (param) {

                parameters.push({
                    type: "query",
                    name: param.name,
                    path: param.name,
                    value: param.value
                });
            }
        );

        parsedData.bodyParams.forEach(
            function (param) {

                parameters.push({
                    type: "body",
                    name: param.name,
                    path: param.path,
                    value: param.value
                });
            }
        );

        if (!parameters.length) {

            container.innerHTML =
                emptyHtml(
                    "没有可配置的动态参数"
                );

            return;
        }

        parameters.forEach(
            function (param, index) {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "batch-parameter-item";

                item.innerHTML = `
                    <label class="batch-parameter-check">

                        <input
                            type="checkbox"
                            class="batch-parameter-checkbox"
                            data-index="${index}"
                            data-type="${escapeHtml(
                                param.type
                            )}"
                            data-path="${escapeHtml(
                                param.path
                            )}"
                        >

                        <span>
                            ${escapeHtml(
                                param.type === "query"
                                    ? "Query"
                                    : "Body"
                            )}
                        </span>

                    </label>

                    <div class="batch-parameter-info">

                        <div class="batch-parameter-name">
                            ${escapeHtml(
                                param.path
                            )}
                        </div>

                        <div class="batch-parameter-value">
                            原始值：
                            ${escapeHtml(
                                String(param.value)
                            )}
                        </div>

                    </div>

                    <div class="batch-parameter-rule">

                        <input
                            type="number"
                            class="batch-parameter-start"
                            value="1"
                            placeholder="起始值"
                        >

                        <span>+</span>

                        <input
                            type="number"
                            class="batch-parameter-step"
                            value="1"
                            placeholder="步长"
                        >

                    </div>
                `;

                container.appendChild(item);
            }
        );
    }


    // =====================================================
    // 获取动态参数
    // =====================================================

    function getDynamicParameters() {

        const result = [];

        const checkboxes =
            document.querySelectorAll(
                ".batch-parameter-checkbox"
            );

        checkboxes.forEach(
            function (checkbox) {

                if (!checkbox.checked) {
                    return;
                }

                const item =
                    checkbox.closest(
                        ".batch-parameter-item"
                    );

                if (!item) {
                    return;
                }

                const startInput =
                    item.querySelector(
                        ".batch-parameter-start"
                    );

                const stepInput =
                    item.querySelector(
                        ".batch-parameter-step"
                    );

                const start =
                    parseFloat(
                        startInput
                            ? startInput.value
                            : "1"
                    );

                const step =
                    parseFloat(
                        stepInput
                            ? stepInput.value
                            : "1"
                    );

                result.push({
                    type:
                        checkbox.dataset.type,

                    path:
                        checkbox.dataset.path,

                    start:
                        Number.isFinite(start)
                            ? start
                            : 1,

                    step:
                        Number.isFinite(step)
                            ? step
                            : 1
                });
            }
        );

        return result;
    }


    // =====================================================
    // 构建批量请求
    // =====================================================

    function buildBatchRequest(index) {

        if (!parsedData) {
            return null;
        }

        const dynamicParameters =
            getDynamicParameters();

        const request = {

            method:
                parsedData.method,

            url:
                parsedData.url,

            headers:
                {
                    ...parsedData.headers
                },

            body:
                parsedData.body || ""
        };


        // -------------------------------------------------
        // 动态参数
        // -------------------------------------------------

        dynamicParameters.forEach(
            function (param) {

                const value =
                    param.start +
                    param.step * index;

                if (
                    param.type === "query"
                ) {

                    request.url =
                        replaceQueryParameter(
                            request.url,
                            param.path,
                            value
                        );
                }

                if (
                    param.type === "body"
                ) {

                    request.body =
                        replaceBodyParameter(
                            request.body,
                            param.path,
                            value
                        );
                }
            }
        );

        return request;
    }


    // =====================================================
    // 替换 Query 参数
    // =====================================================

    function replaceQueryParameter(
        url,
        key,
        value
    ) {

        try {

            const urlObject =
                new URL(url);

            urlObject.searchParams.set(
                key,
                String(value)
            );

            return urlObject.toString();

        } catch (error) {

            const regex =
                new RegExp(
                    "([?&])" +
                    escapeRegExp(key) +
                    "=([^&#]*)",
                    "i"
                );

            if (regex.test(url)) {

                return url.replace(
                    regex,
                    "$1" +
                    key +
                    "=" +
                    encodeURIComponent(value)
                );
            }

            const separator =
                url.includes("?")
                    ? "&"
                    : "?";

            return (
                url +
                separator +
                encodeURIComponent(key) +
                "=" +
                encodeURIComponent(value)
            );
        }
    }


    // =====================================================
    // 替换 Body 参数
    // =====================================================

    function replaceBodyParameter(
        body,
        path,
        value
    ) {

        if (!body) {
            return body;
        }

        // JSON
        if (isJson(body)) {

            try {

                const json =
                    JSON.parse(body);

                setObjectValue(
                    json,
                    path,
                    value
                );

                return JSON.stringify(
                    json
                );

            } catch (error) {

                // JSON 解析失败继续走文本替换
            }
        }


        // Form
        const regex =
            new RegExp(
                "(^|&)" +
                escapeRegExp(path) +
                "=([^&]*)",
                "i"
            );

        if (regex.test(body)) {

            return body.replace(
                regex,
                "$1" +
                path +
                "=" +
                encodeURIComponent(value)
            );
        }


        // 普通文本
        return body.replace(
            new RegExp(
                escapeRegExp(path),
                "g"
            ),
            String(value)
        );
    }


    // =====================================================
    // 设置 JSON 路径
    // =====================================================

    function setObjectValue(
        object,
        path,
        value
    ) {

        if (
            !object ||
            !path
        ) {
            return;
        }

        const parts =
            parsePath(path);

        let current =
            object;

        for (
            let i = 0;
            i < parts.length - 1;
            i++
        ) {

            const key =
                parts[i];

            if (
                current[key] === undefined ||
                current[key] === null
            ) {

                current[key] = {};
            }

            current =
                current[key];
        }

        if (parts.length) {

            current[
                parts[parts.length - 1]
            ] = value;
        }
    }


    // =====================================================
    // JSON 路径解析
    // =====================================================

    function parsePath(path) {

        return path
            .replace(
                /\[(\d+)\]/g,
                ".$1"
            )
            .split(".")
            .filter(
                function (item) {
                    return item !== "";
                }
            );
    }


    // =====================================================
    // 预览批量请求
    // =====================================================

    function previewBatch() {

        // 预览时清除执行结果
        clearBatchResults();

        if (!parsedData) {

            showMessage(
                "请先解析 Curl",
                "error"
            );

            return;
        }

        const countInput =
            document.getElementById(
                "batchCount"
            );

        const batchCount =
            parseInt(
                countInput
                    ? countInput.value
                    : "1",
                10
            ) || 1;

        const previewCard =
            document.getElementById(
                "batchPreviewCard"
            );

        const previewList =
            document.getElementById(
                "batchPreviewList"
            );

        if (
            !previewCard ||
            !previewList
        ) {
            return;
        }

        previewList.innerHTML = "";

        const previewCount =
            Math.min(
                batchCount,
                5
            );

        for (
            let i = 0;
            i < previewCount;
            i++
        ) {

            const request =
                buildBatchRequest(i);

            if (!request) {
                continue;
            }

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "batch-preview-item";

            item.innerHTML = `

                <div class="batch-preview-header">

                    <strong>
                        第 ${i + 1} 个请求
                    </strong>

                </div>

                <div class="batch-preview-content">

                    <div>
                        <strong>Method：</strong>
                        ${escapeHtml(
                            request.method
                        )}
                    </div>

                    <div>
                        <strong>URL：</strong>
                        ${escapeHtml(
                            request.url
                        )}
                    </div>

                    ${
                        request.body
                            ? `
                                <div>
                                    <strong>
                                        Body：
                                    </strong>
                                </div>

                                <pre class="batch-detail-pre">${escapeHtml(
                                    formatResponseBody(
                                        request.body
                                    )
                                )}</pre>
                            `
                            : ""
                    }

                </div>
            `;

            previewList.appendChild(item);
        }

        previewCard.classList.remove(
            "hidden"
        );

        showMessage(
            "批量请求预览已生成",
            "success"
        );
    }


    // =====================================================
    // 开始批量请求
    // =====================================================

    async function startBatch() {

        // 执行时清除预览
        clearBatchPreview();

        if (!parsedData) {

            showMessage(
                "请先解析 Curl",
                "error"
            );

            return;
        }

        const countInput =
            document.getElementById(
                "batchCount"
            );

        const concurrencyInput =
            document.getElementById(
                "batchConcurrency"
            );

        const batchCount =
            parseInt(
                countInput
                    ? countInput.value
                    : "1",
                10
            ) || 1;

        const concurrency =
            parseInt(
                concurrencyInput
                    ? concurrencyInput.value
                    : "1",
                10
            ) || 1;

        if (batchCount < 1) {

            showMessage(
                "请求数量必须大于 0",
                "error"
            );

            return;
        }

        if (concurrency < 1) {

            showMessage(
                "并发数必须大于 0",
                "error"
            );

            return;
        }


        const resultCard =
            document.getElementById(
                "batchResultCard"
            );

        const resultList =
            document.getElementById(
                "batchResultList"
            );

        if (
            !resultCard ||
            !resultList
        ) {
            return;
        }


        // 清除旧结果
        resultList.innerHTML = "";

        resultCard.classList.remove(
            "hidden"
        );


        setText(
            "batchTotalCount",
            batchCount
        );

        setText(
            "batchSuccessCount",
            0
        );

        setText(
            "batchFailedCount",
            0
        );


        const results =
            new Array(batchCount);

        let currentIndex = 0;

        async function worker() {

            while (true) {

                const index =
                    currentIndex++;

                if (
                    index >= batchCount
                ) {
                    break;
                }

                const request =
                    buildBatchRequest(
                        index
                    );

                console.log(
                    "批量请求 #" +
                    (index + 1),
                    request
                );


                // URL 防御
                if (
                    !request ||
                    !request.url
                ) {

                    results[index] = {

                        success: false,

                        index: index,

                        status: 0,

                        url: "",

                        elapsed: 0,

                        response: "",

                        headers:
                            request
                                ? request.headers
                                : {},

                        body:
                            request
                                ? request.body
                                : "",

                        error:
                            "请求 URL 为空"
                    };

                    updateResultSummary(
                        results
                    );

                    continue;
                }


                const result =
                    await sendRequest(
                        request,
                        index
                    );

                results[index] =
                    result;

                updateResultSummary(
                    results
                );
            }
        }


        const workers = [];

        const workerCount =
            Math.min(
                concurrency,
                batchCount
            );

        for (
            let i = 0;
            i < workerCount;
            i++
        ) {

            workers.push(
                worker()
            );
        }

        await Promise.all(
            workers
        );

        showMessage(
            "批量请求执行完成",
            "success"
        );
    }


    // =====================================================
    // 发送请求
    // =====================================================

    async function sendRequest(
        requestData,
        index
    ) {

        const startTime =
            Date.now();

        console.log(
            "准备请求：",
            requestData
        );

        console.log(
            "请求 URL：",
            requestData.url
        );


        try {

            const method =
                (
                    requestData.method ||
                    "GET"
                ).toUpperCase();


            const options = {

                method: method,

                headers:
                    requestData.headers ||
                    {}
            };


            // GET / HEAD 不能带 body
            if (
                method !== "GET" &&
                method !== "HEAD"
            ) {

                if (
                    requestData.body !==
                    undefined &&
                    requestData.body !== null &&
                    requestData.body !== ""
                ) {

                    options.body =
                        requestData.body;
                }
            }


            const response =
                await fetch(
                    requestData.url,
                    options
                );


            const responseText =
                await response.text();


            const elapsed =
                Date.now() -
                startTime;


            return {

                success:
                    response.ok,

                index:
                    index,

                status:
                    response.status,

                statusText:
                    response.statusText,

                url:
                    requestData.url,

                elapsed:
                    elapsed,

                response:
                    responseText,

                headers:
                    requestData.headers ||
                    {},

                body:
                    requestData.body ||
                    "",

                error:
                    response.ok
                        ? ""
                        : "HTTP " +
                          response.status +
                          (
                              response.statusText
                                  ? " " +
                                    response.statusText
                                  : ""
                          )
            };

        } catch (error) {

            console.error(
                "请求失败：",
                requestData.url,
                error
            );


            return {

                success:
                    false,

                index:
                    index,

                status:
                    0,

                statusText:
                    "",

                url:
                    requestData.url ||
                    "",

                elapsed:
                    Date.now() -
                    startTime,

                response:
                    "",

                headers:
                    requestData.headers ||
                    {},

                body:
                    requestData.body ||
                    "",

                error:
                    error.message ||
                    "请求失败"
            };
        }
    }


    // =====================================================
    // 更新结果统计
    // =====================================================

    function updateResultSummary(
        results
    ) {

        const totalElement =
            document.getElementById(
                "batchTotalCount"
            );

        const successElement =
            document.getElementById(
                "batchSuccessCount"
            );

        const failedElement =
            document.getElementById(
                "batchFailedCount"
            );

        const resultList =
            document.getElementById(
                "batchResultList"
            );

        if (!resultList) {
            return;
        }


        let successCount = 0;

        let failedCount = 0;


        results.forEach(
            function (result) {

                if (!result) {
                    return;
                }

                if (result.success) {
                    successCount++;
                } else {
                    failedCount++;
                }
            }
        );


        if (totalElement) {

            const completedCount =
                successCount +
                failedCount;

            totalElement.textContent =
                completedCount +
                " / " +
                results.length;
        }


        if (successElement) {

            successElement.textContent =
                successCount;
        }


        if (failedElement) {

            failedElement.textContent =
                failedCount;
        }


        // 重新渲染
        resultList.innerHTML = "";


        results.forEach(
            function (result) {

                if (!result) {
                    return;
                }

                const element =
                    createResultElement(
                        result
                    );

                if (element) {

                    resultList.appendChild(
                        element
                    );
                }
            }
        );
    }


    // =====================================================
    // 创建结果
    // =====================================================

    function createResultElement(
        result
    ) {

        const item =
            document.createElement(
                "div"
            );

        item.className =
            "batch-result-item";


        const success =
            result.success;


        const statusText =
            result.status > 0
                ? String(result.status)
                : "ERROR";


        item.innerHTML = `

            <div class="batch-result-header">

                <div>

                    <strong>
                        第 ${result.index + 1} 个请求
                    </strong>

                    <span
                        class="batch-result-status ${
                            success
                                ? "success"
                                : "error"
                        }"
                    >
                        ${escapeHtml(
                            statusText
                        )}
                    </span>

                </div>


                <button
                    type="button"
                    class="btn btn-sm btn-outline-primary batch-view-button"
                >
                    查看
                </button>

            </div>


            <div class="batch-result-content">

                <div>
                    <strong>耗时：</strong>
                    ${escapeHtml(
                        String(
                            result.elapsed
                        )
                    )} ms
                </div>

                <div class="batch-result-url">
                    <strong>URL：</strong>
                    ${escapeHtml(
                        result.url ||
                        "-"
                    )}
                </div>

                ${
                    !success &&
                    result.error
                        ? `
                            <div class="batch-result-error">
                                <strong>
                                    错误：
                                </strong>

                                ${escapeHtml(
                                    result.error
                                )}
                            </div>
                        `
                        : ""
                }

            </div>
        `;


        const viewButton =
            item.querySelector(
                ".batch-view-button"
            );


        if (viewButton) {

            viewButton.addEventListener(
                "click",
                function () {

                    showResultDetail(
                        result
                    );
                }
            );
        }


        return item;
    }


    // =====================================================
    // 查看请求结果
    // =====================================================

    function showResultDetail(
        result
    ) {

        let modalElement =
            document.getElementById(
                "curlResultDetailModal"
            );


        if (!modalElement) {

            modalElement =
                document.createElement(
                    "div"
                );

            modalElement.id =
                "curlResultDetailModal";

            modalElement.className =
                "modal fade";

            modalElement.tabIndex = -1;

            modalElement.innerHTML = `

                <div class="modal-dialog modal-xl modal-dialog-scrollable">

                    <div class="modal-content">

                        <div class="modal-header">

                            <h5 class="modal-title">
                                请求详情
                            </h5>

                            <button
                                type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                            ></button>

                        </div>


                        <div class="modal-body">

                            <div
                                id="curlResultDetailContent"
                            ></div>

                        </div>


                        <div class="modal-footer">

                            <button
                                type="button"
                                class="btn btn-secondary"
                                data-bs-dismiss="modal"
                            >
                                关闭
                            </button>

                        </div>

                    </div>

                </div>
            `;

            document.body.appendChild(
                modalElement
            );
        }


        const content =
            document.getElementById(
                "curlResultDetailContent"
            );


        if (!content) {
            return;
        }


        content.innerHTML = `

            <div class="row g-3">

                <div class="col-md-4">

                    <div class="card h-100">

                        <div class="card-body">

                            <div class="text-muted small">
                                状态码
                            </div>

                            <div class="fs-4 fw-bold">
                                ${escapeHtml(
                                    String(
                                        result.status ||
                                        "ERROR"
                                    )
                                )}
                            </div>

                        </div>

                    </div>

                </div>


                <div class="col-md-4">

                    <div class="card h-100">

                        <div class="card-body">

                            <div class="text-muted small">
                                请求方法
                            </div>

                            <div class="fs-5 fw-semibold">
                                ${escapeHtml(
                                    parsedData
                                        ? parsedData.method
                                        : "-"
                                )}
                            </div>

                        </div>

                    </div>

                </div>


                <div class="col-md-4">

                    <div class="card h-100">

                        <div class="card-body">

                            <div class="text-muted small">
                                耗时
                            </div>

                            <div class="fs-5 fw-semibold">
                                ${escapeHtml(
                                    String(
                                        result.elapsed
                                    )
                                )} ms
                            </div>

                        </div>

                    </div>

                </div>

            </div>


            <div class="mt-4">

                <h6>
                    Request URL
                </h6>

                <pre class="batch-detail-pre">${escapeHtml(
                    result.url ||
                    "-"
                )}</pre>

            </div>


            <div class="mt-4">

                <h6>
                    Request Headers
                </h6>

                <pre class="batch-detail-pre">${escapeHtml(
                    JSON.stringify(
                        result.headers || {},
                        null,
                        2
                    )
                )}</pre>

            </div>


            <div class="mt-4">

                <h6>
                    Request Body
                </h6>

                <pre class="batch-detail-pre">${escapeHtml(
                    formatResponseBody(
                        result.body || ""
                    )
                )}</pre>

            </div>


            <div class="mt-4">

                <h6>
                    Response Body
                </h6>

                <pre class="batch-detail-pre">${escapeHtml(
                    formatResponseBody(
                        result.response || ""
                    )
                )}</pre>

            </div>


            ${
                result.error
                    ? `
                        <div class="mt-4">

                            <h6>
                                Error
                            </h6>

                            <div class="alert alert-danger">
                                ${escapeHtml(
                                    result.error
                                )}
                            </div>

                        </div>
                    `
                    : ""
            }

        `;


        if (
            typeof bootstrap !==
            "undefined"
        ) {

            const modal =
                bootstrap.Modal.getOrCreateInstance(
                    modalElement
                );

            modal.show();

        } else {

            // 没有 Bootstrap 时备用显示
            modalElement.style.display =
                "block";

            modalElement.classList.add(
                "show"
            );
        }
    }


    // =====================================================
    // 清除 Curl
    // =====================================================

    function clearCurl() {

        const input =
            document.getElementById(
                "curlInput"
            );

        if (input) {
            input.value = "";
        }

        parsedData = null;

        const parseResult =
            document.getElementById(
                "curlParseResult"
            );

        if (parseResult) {

            parseResult.classList.add(
                "hidden"
            );
        }

        clearBatchPreview();

        clearBatchResults();

        showMessage(
            "",
            ""
        );
    }


    // =====================================================
    // 清除预览
    // =====================================================

    function clearBatchPreview() {

        const previewList =
            document.getElementById(
                "batchPreviewList"
            );

        const previewCard =
            document.getElementById(
                "batchPreviewCard"
            );

        if (previewList) {

            previewList.innerHTML = "";
        }

        if (previewCard) {

            previewCard.classList.add(
                "hidden"
            );
        }
    }


    // =====================================================
    // 清除执行结果
    // =====================================================

    function clearBatchResults() {

        const resultList =
            document.getElementById(
                "batchResultList"
            );

        const resultCard =
            document.getElementById(
                "batchResultCard"
            );

        if (resultList) {

            resultList.innerHTML = "";
        }

        if (resultCard) {

            resultCard.classList.add(
                "hidden"
            );
        }

        setText(
            "batchTotalCount",
            "0"
        );

        setText(
            "batchSuccessCount",
            "0"
        );

        setText(
            "batchFailedCount",
            "0"
        );
    }


    // =====================================================
    // 格式化 Response
    // =====================================================

    function formatResponseBody(
        body
    ) {

        if (
            body === null ||
            body === undefined
        ) {
            return "";
        }

        const text =
            String(body);

        if (!text.trim()) {
            return "";
        }

        try {

            const json =
                JSON.parse(text);

            return JSON.stringify(
                json,
                null,
                2
            );

        } catch (error) {

            return text;
        }
    }


    // =====================================================
    // 消息提示
    // =====================================================

    function showMessage(
        message,
        type
    ) {

        const element =
            document.getElementById(
                "curlMessage"
            );

        if (!element) {
            return;
        }

        element.textContent =
            message || "";

        element.className =
            "curl-batch-message";


        if (!message) {
            return;
        }


        if (type === "success") {

            element.classList.add(
                "success"
            );

        } else if (
            type === "error"
        ) {

            element.classList.add(
                "error"
            );
        }
    }


    // =====================================================
    // HTML 转义
    // =====================================================

    function escapeHtml(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }


    // =====================================================
    // 正则转义
    // =====================================================

    function escapeRegExp(
        value
    ) {

        return String(value)
            .replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );
    }


    // =====================================================
    // 空数据
    // =====================================================

    function emptyHtml(
        text
    ) {

        return `
            <div
                style="
                    padding: 15px;
                    color: #9ca3af;
                    text-align: center;
                "
            >
                ${escapeHtml(text)}
            </div>
        `;
    }


    // =====================================================
    // 设置文本
    // =====================================================

    function setText(
        id,
        value
    ) {

        const element =
            document.getElementById(id);

        if (element) {

            element.textContent =
                String(value);
        }
    }


    // =====================================================
    // 暴露初始化函数
    // =====================================================

    window.initCurlBatchTool =
        initCurlBatchTool;

})();