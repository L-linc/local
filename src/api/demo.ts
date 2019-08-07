import instance from './index';

const httpDemo = {
  permission: 'get,/api/url',
  req: (params: object) => {
    return instance.get('/api/url', {params});
  },
};

export {
  httpDemo,
};
