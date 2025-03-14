const validateInput = (url, method, headers) => {
    if (!url.startsWith('https://')) {
      throw new Error('Допускаются только HTTPS-запросы');
    }
    if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
      throw new Error('Недопустимый метод запроса');
    }
  };
  
  const parseResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    return contentType && contentType.includes('application/json') 
      ? await response.json() 
      : await response.text();
  };
  
  export const sendRequest = async (
    url,
    method = 'GET',
    body = null,
    headers = {}
  ) => {
    try {
      validateInput(url, method, headers);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
  
      const config = {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        signal: controller.signal
      };
  
      if (body && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
        config.body = JSON.stringify(body);
      }
  
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      return await parseResponse(response);
    } catch (error) {
      throw new Error(`Request failed: ${error.message}`);
    }
  };
